import { useMemo } from 'react';
import { useMembers } from '../../contexts/MemberContext';
import { useReferenceData } from '../../contexts/ReferenceDataContext';
import { Card, CardBody, EmptyState, HandshakeIcon } from '../../components/ui';
import type { MeetingRole, RoleType } from '../../types';
import { MULTI_SLOT_KEYS, ROLE_GROUPS } from './roleGroups';

interface RolesViewProps {
  roles: MeetingRole[];
}

interface DisplayRow {
  label: string;
  memberName: string;
}

export function RolesView({ roles }: RolesViewProps) {
  const { roleTypes } = useReferenceData();
  const { members } = useMembers();

  const groups = useMemo(() => {
    const memberById = new Map(members.map(m => [m.id, m]));
    const roleTypeByKey = new Map<string, RoleType>();
    for (const rt of roleTypes) roleTypeByKey.set(rt.role_key, rt);

    return ROLE_GROUPS.map(group => {
      const rows: DisplayRow[] = [];
      for (const key of group.keys) {
        const roleType = roleTypeByKey.get(key);
        if (!roleType) continue;
        const assigned = roles
          .filter(r => r.role_type_id === roleType.id && r.member_id)
          .sort((a, b) => a.slot_order - b.slot_order);
        const isMulti = MULTI_SLOT_KEYS.has(key);
        assigned.forEach((role, idx) => {
          const member = role.member_id ? memberById.get(role.member_id) : null;
          if (!member) return;
          rows.push({
            label: isMulti ? `${roleType.display_name} #${idx + 1}` : roleType.display_name,
            memberName: member.full_name,
          });
        });
      }
      return { label: group.label, rows };
    }).filter(group => group.rows.length > 0);
  }, [roles, roleTypes, members]);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<HandshakeIcon size={40} />}
        title="No roles assigned"
        description="Click Edit to assign members to roles."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(group => (
        <Card key={group.label}>
          <CardBody className="flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60">
              <h3 className="font-serif text-lg text-ink">{group.label}</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-light">
                {group.rows.length} filled
              </span>
            </div>
            <ul className="flex flex-col divide-y divide-cream-dark/40">
              {group.rows.map((row, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 group">
                  <span className="flex items-center gap-2 text-sm text-ink-mid">
                    <span className="w-1.5 h-1.5 rounded-full bg-burgundy/60 group-hover:bg-burgundy transition-colors" />
                    {row.label}
                  </span>
                  <span className="text-sm text-ink font-medium">{row.memberName}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
