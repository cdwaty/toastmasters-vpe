import { Card, EmptyState, PageHeader } from '../components/ui';

export const ReportsPage = () => <Stub title="Reports" body="Filterable reports with CSV export." />;
export const AdminPage = () => <Stub title="Admin" body="Pathways, role types, system settings." />;

function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <Card>
        <EmptyState title="Coming next" description={body} />
      </Card>
    </div>
  );
}
