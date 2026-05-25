import { useEffect, useState } from 'react';
import { Button, EmptyState, PathwayCardSkeleton, PlusIcon, RouteIcon } from '../../../components/ui';
import { useReferenceData } from '../../../contexts/ReferenceDataContext';
import { usePathways } from '../../../contexts/PathwayContext';
import { PathwayCard } from './PathwayCard';
import { AddPathwayDialog } from './AddPathwayDialog';

interface PathwaysTabProps {
  memberId: string;
}

export function PathwaysTab({ memberId }: PathwaysTabProps) {
  const { pathways, completions, awards, loading, error, loadForMember } = usePathways();
  const { pathwayTypes } = useReferenceData();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    loadForMember(memberId);
  }, [memberId, loadForMember]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <PathwayCardSkeleton />
        <PathwayCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-danger bg-danger-light border border-danger/30 px-3 py-2 rounded-lg">
          Could not load pathways: {error}
        </p>
        <Button variant="secondary" onClick={() => loadForMember(memberId)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pathways.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setAddOpen(true)} icon={<PlusIcon size={16} />}>Add pathway</Button>
        </div>
      )}

      {pathways.length === 0 ? (
        <EmptyState
          icon={<RouteIcon size={40} />}
          title="No pathways yet"
          description="Add a pathway to start tracking progress through projects and levels."
          action={<Button onClick={() => setAddOpen(true)} icon={<PlusIcon size={16} />}>Add pathway</Button>}
        />
      ) : (
        pathways.map(pathway => (
          <PathwayCard
            key={pathway.id}
            pathway={pathway}
            pathwayType={pathwayTypes.find(pt => pt.id === pathway.pathway_type_id)}
            completions={completions.filter(c => c.pathway_id === pathway.id)}
            awards={awards.filter(a => a.pathway_id === pathway.id)}
          />
        ))
      )}

      <AddPathwayDialog open={addOpen} memberId={memberId} onClose={() => setAddOpen(false)} />
    </div>
  );
}
