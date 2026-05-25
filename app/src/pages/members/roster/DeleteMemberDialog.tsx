import { ConfirmDialog } from '../../../components/ui';
import type { Member } from '../../../types';

interface DeleteMemberDialogProps {
  member: Member | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteMemberDialog({ member, loading, onConfirm, onCancel }: DeleteMemberDialogProps) {
  return (
    <ConfirmDialog
      open={!!member}
      title="Delete member?"
      message={member
        ? `This will permanently delete ${member.full_name} and all associated pathways and history. This cannot be undone.`
        : ''}
      variant="danger"
      confirmLabel="Delete"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
