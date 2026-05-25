export interface PathwayHtmlEntry {
  rawMemberName: string;
  rawPathwayName: string;
  rawProjectName: string;
  level: number | null;
  date: string;
  title: string;
}

const LEVEL_RE = /level\s*(\d+)/i;
const PATHWAY_PROJECT_SPLIT_RE = /^(.+?)\s*[:–—\-]\s*level\s*\d+\s*[:–—\-]\s*(.+)$/i;

function parseProjectCell(raw: string): { pathway: string; level: number | null; project: string } {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  const match = trimmed.match(PATHWAY_PROJECT_SPLIT_RE);
  if (match) {
    const levelMatch = trimmed.match(LEVEL_RE);
    return {
      pathway: match[1].trim(),
      level: levelMatch ? Number(levelMatch[1]) : null,
      project: match[2].trim(),
    };
  }
  const levelMatch = trimmed.match(LEVEL_RE);
  return {
    pathway: '',
    level: levelMatch ? Number(levelMatch[1]) : null,
    project: trimmed,
  };
}

function parseDateCell(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

export function parsePathwayHtml(htmlText: string): PathwayHtmlEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  let target: HTMLTableElement | null = null;
  doc.querySelectorAll('table').forEach(tbl => {
    const headers = Array.from(tbl.querySelectorAll('thead th'))
      .map(th => (th.textContent ?? '').trim().toLowerCase());
    const hasName = headers.some(h => h.includes('name'));
    const hasProject = headers.some(h => h.includes('manual') || h.includes('project'));
    if (hasName && hasProject) target = tbl as HTMLTableElement;
  });

  if (!target) {
    throw new Error('Could not find the speech history table. Expected columns: Name, Date, Manual/Project.');
  }

  const headers = Array.from((target as HTMLTableElement).querySelectorAll('thead th'))
    .map(th => (th.textContent ?? '').trim().toLowerCase());
  const colName = headers.findIndex(h => h === 'name');
  const colDate = headers.findIndex(h => h === 'date');
  const colTitle = headers.findIndex(h => h === 'title');
  const colProject = headers.findIndex(h => h.includes('manual') || h.includes('project'));

  if (colName < 0 || colProject < 0) {
    throw new Error('Required columns (Name, Manual/Project) missing.');
  }

  const entries: PathwayHtmlEntry[] = [];
  let currentMember = '';

  (target as HTMLTableElement).querySelectorAll('tbody tr').forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('td'));
    if (cells.length <= colProject) return;

    const cellText = (idx: number) =>
      idx >= 0 && idx < cells.length
        ? (cells[idx].textContent ?? '').replace(/\s+/g, ' ').trim()
        : '';

    const nameRaw = cellText(colName);
    if (nameRaw) currentMember = nameRaw.split(',')[0].trim();
    if (!currentMember) return;

    const projectCell = cells[colProject];
    const projectRaw = projectCell
      ? projectCell.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';
    if (!projectRaw) return;

    const { pathway, level, project } = parseProjectCell(projectRaw);
    if (!pathway) return;

    entries.push({
      rawMemberName: currentMember,
      rawPathwayName: pathway,
      rawProjectName: project,
      level,
      date: colDate >= 0 ? parseDateCell(cellText(colDate)) : '',
      title: colTitle >= 0 ? cellText(colTitle) : '',
    });
  });

  return entries;
}
