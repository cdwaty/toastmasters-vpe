import { useState } from 'react';
import { Button, Card, CardBody, DownloadIcon, FileTextIcon, FolderIcon, PageHeader } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { fetchSnapshot, buildLegacyExport } from '../../lib/export/exportData';
import { membersToCsv } from '../../lib/export/membersCsv';
import { downloadFile, timestampSuffix } from '../../lib/export/download';

type ExportKind = 'json' | 'csv';

export function ExportPage() {
  const { notify } = useToast();
  const [busy, setBusy] = useState<ExportKind | null>(null);

  const exportJson = async () => {
    setBusy('json');
    const result = await fetchSnapshot();
    setBusy(null);
    if (!result.ok) {
      notify(`JSON export failed: ${result.error.message}`, 'error');
      return;
    }
    const legacy = buildLegacyExport(result.data);
    downloadFile(
      `toastmasters-export-${timestampSuffix()}.json`,
      JSON.stringify(legacy, null, 2),
      'application/json',
    );
    notify(`JSON snapshot downloaded (${legacy.members.length} members, ${legacy.meetings?.length ?? 0} meetings)`);
  };

  const exportMembersCsv = async () => {
    setBusy('csv');
    const result = await fetchSnapshot();
    setBusy(null);
    if (!result.ok) {
      notify(`CSV export failed: ${result.error.message}`, 'error');
      return;
    }
    const csv = membersToCsv(result.data.members);
    downloadFile(
      `toastmasters-members-${timestampSuffix()}.csv`,
      csv,
      'text/csv;charset=utf-8',
    );
    notify(`Members CSV downloaded (${result.data.members.length} rows)`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Export data"
        description="Download a snapshot of all club data. Keep regular backups in case of migrations or accidental changes."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0">
                <FolderIcon size={20} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-serif text-lg text-ink leading-tight">Full snapshot</h2>
                <p className="text-xs text-ink-light uppercase tracking-wide">JSON · complete backup</p>
              </div>
            </div>
            <p className="text-sm text-ink-light leading-relaxed">
              Everything — members, pathways, project completions, level awards, change history,
              mentorships, meetings, role assignments, and attendance.
            </p>
            <ul className="text-xs text-ink-mid flex flex-col gap-1.5 border-l-2 border-cream-dark pl-3">
              <li>Use as a full backup before bulk changes.</li>
              <li>Restore via the database — keep this file safe.</li>
            </ul>
            <Button
              onClick={exportJson}
              loading={busy === 'json'}
              disabled={busy !== null}
              icon={<DownloadIcon size={16} />}
            >
              Download JSON
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                <FileTextIcon size={20} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-serif text-lg text-ink leading-tight">Members roster</h2>
                <p className="text-xs text-ink-light uppercase tracking-wide">CSV · spreadsheet</p>
              </div>
            </div>
            <p className="text-sm text-ink-light leading-relaxed">
              Flat member roster — name, contact, type, club preference, dates, education award.
            </p>
            <ul className="text-xs text-ink-mid flex flex-col gap-1.5 border-l-2 border-cream-dark pl-3">
              <li>Open directly in Excel or Google Sheets.</li>
              <li>Share with committee members for reporting.</li>
            </ul>
            <Button
              onClick={exportMembersCsv}
              loading={busy === 'csv'}
              disabled={busy !== null}
              icon={<DownloadIcon size={16} />}
              variant="secondary"
            >
              Download CSV
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
