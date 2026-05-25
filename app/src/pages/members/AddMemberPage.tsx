import { useNavigate } from 'react-router';
import { useMembers } from '../../contexts/MemberContext';
import { useToast } from '../../contexts/ToastContext';
import { Button, PageHeader } from '../../components/ui';
import { MemberForm, MemberPreviewCard } from './MemberForm';

export function AddMemberPage() {
  const { addMember } = useMembers();
  const { notify } = useToast();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Member"
        description="Fill in the member's details to add them to the roster"
        actions={
          <Button variant="secondary" onClick={() => navigate('/members')}>
            ← Back
          </Button>
        }
      />
      <MemberForm
        submitLabel="Save Member"
        aside={<MemberPreviewCard />}
        onSubmit={async values => {
          const created = await addMember(values);
          if (created) {
            notify(`Member ${created.full_name} added`);
            navigate('/members');
          } else {
            notify('Failed to add member. Try again.', 'error');
          }
        }}
      />
    </div>
  );
}
