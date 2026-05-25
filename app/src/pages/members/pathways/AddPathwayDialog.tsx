import { useState } from 'react';
import { Button, Modal, RouteIcon, Select } from '../../../components/ui';
import { useReferenceData } from '../../../contexts/ReferenceDataContext';
import { usePathways } from '../../../contexts/PathwayContext';
import { useToast } from '../../../contexts/ToastContext';

interface AddPathwayDialogProps {
  open: boolean;
  memberId: string;
  onClose: () => void;
}

export function AddPathwayDialog({ open, memberId, onClose }: AddPathwayDialogProps) {
  const { pathwayTypes } = useReferenceData();
  const { pathways, addPathway } = usePathways();
  const { notify } = useToast();
  const [pathwayTypeId, setPathwayTypeId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const existingIds = new Set(pathways.map(p => p.pathway_type_id));
  const available = pathwayTypes.filter(pt => !existingIds.has(pt.id));
  const currentOptions = available
    .filter(pt => !pt.is_legacy)
    .map(pt => ({ value: pt.id, label: pt.pathway_name }));
  const legacyOptions = available
    .filter(pt => pt.is_legacy)
    .map(pt => ({ value: pt.id, label: pt.pathway_name }));
  const groups = [
    ...(currentOptions.length > 0 ? [{ label: 'Current Pathways', options: currentOptions }] : []),
    ...(legacyOptions.length > 0 ? [{ label: 'Legacy Pathways', options: legacyOptions }] : []),
  ];
  const totalOptions = currentOptions.length + legacyOptions.length;
  const isFirstPathway = pathways.length === 0;
  const selectedPathway = pathwayTypes.find(pt => pt.id === pathwayTypeId);
  const projectsCount = selectedPathway?.pathway_levels
    ?.reduce((sum, l) => sum + (l.pathway_projects?.length ?? 0), 0) ?? 0;
  const levelsCount = selectedPathway?.pathway_levels?.length ?? 0;

  const handleAdd = async () => {
    if (!pathwayTypeId) return;
    setSubmitting(true);
    const result = await addPathway({
      member_id: memberId,
      pathway_type_id: pathwayTypeId,
      is_primary: isFirstPathway || isPrimary,
      current_level: 1,
      start_date: new Date().toISOString().slice(0, 10),
    });
    setSubmitting(false);
    if (result) {
      const name = selectedPathway?.pathway_name ?? 'pathway';
      notify(`Pathway "${name}" added`);
      setPathwayTypeId('');
      setIsPrimary(false);
      onClose();
    } else {
      notify('Could not add pathway. Try again.', 'error');
    }
  };

  const handleClose = () => {
    setPathwayTypeId('');
    setIsPrimary(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a new pathway"
      description="Assign a Toastmasters pathway to start tracking project and level progress."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} loading={submitting} disabled={!pathwayTypeId}>
            Add pathway
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 bg-cream rounded-lg">
          <div className="w-9 h-9 rounded-full bg-burgundy/10 text-burgundy inline-flex items-center justify-center shrink-0">
            <RouteIcon size={18} />
          </div>
          <div className="text-sm text-ink-mid">
            Toastmasters Pathways guide members through 5 levels with required and elective projects.
            {totalOptions === 0 && (
              <span className="block mt-1 text-warning font-medium">
                All available pathways have already been assigned to this member.
              </span>
            )}
          </div>
        </div>

        <Select
          label="Pathway"
          value={pathwayTypeId}
          onChange={e => setPathwayTypeId(e.target.value)}
          groups={groups}
          placeholder="Select a pathway"
          requiredMark
          disabled={totalOptions === 0}
        />

        {selectedPathway && (
          <div className="bg-white border border-line rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium text-ink truncate">{selectedPathway.pathway_name}</div>
              <div className="text-xs text-ink-light mt-0.5">
                {levelsCount} level{levelsCount === 1 ? '' : 's'} · {projectsCount} project{projectsCount === 1 ? '' : 's'}
                {selectedPathway.is_legacy && ' · Legacy pathway'}
              </div>
            </div>
          </div>
        )}

        {!isFirstPathway && (
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-mid">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={e => setIsPrimary(e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            Set as primary pathway
          </label>
        )}
        {isFirstPathway && (
          <p className="text-xs text-ink-light">
            This will be set as the member&rsquo;s primary pathway automatically.
          </p>
        )}
      </div>
    </Modal>
  );
}
