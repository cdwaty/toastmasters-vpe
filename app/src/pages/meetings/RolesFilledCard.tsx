import { memo } from 'react';
import { Card, CardBody } from '../../components/ui';

export interface FilledRole {
  label: string;
  member: string;
}

interface Props {
  filledRoles: FilledRole[];
}

function RolesFilledCardImpl({ filledRoles }: Props) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <h3 className="font-serif text-lg text-ink">Roles Filled</h3>
        {filledRoles.length === 0 ? (
          <p className="text-sm text-ink-light italic">No roles assigned yet.</p>
        ) : (
          <ul className="flex flex-col text-sm divide-y divide-cream-dark/60">
            {filledRoles.map((line, i) => (
              <li key={i} className="flex justify-between gap-3 py-1.5">
                <span className="text-ink-light">{line.label}</span>
                <span className="text-ink font-medium truncate text-right">{line.member}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export const RolesFilledCard = memo(RolesFilledCardImpl);
