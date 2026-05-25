import { memo, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardBody, Select } from '../../components/ui';
import type { Member, RoleType } from '../../types';
import { MULTI_SLOT_KEYS, ROLE_GROUPS } from './roleGroups';
import type { RoleSlots } from './meetingFormHelpers';

interface Props {
  roleSlots: RoleSlots;
  rolesByKey: Map<string, RoleType>;
  memberOptions: { value: string; label: string }[];
  activeMembers: Member[];
  updateSlot: (roleTypeId: string, slotIndex: number, memberId: string | null) => void;
  addSlot: (roleTypeId: string) => void;
}

function RoleAssignmentSectionImpl({
  roleSlots, rolesByKey, memberOptions, activeMembers, updateSlot, addSlot,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-ink">Role Assignments</h3>
          <span className="text-xs text-ink-light">All roles optional</span>
        </div>

        {activeMembers.length === 0 && (
          <div className="text-sm text-ink-mid bg-cream border border-cream-dark rounded-lg px-4 py-3">
            No active members yet. <Link to="/members/add" className="text-burgundy font-medium hover:underline">Add a member</Link> to assign roles and attendance.
          </div>
        )}

        {ROLE_GROUPS.map(group => {
          const groupRoles = group.keys
            .map(key => rolesByKey.get(key))
            .filter((rt): rt is RoleType => !!rt);
          if (groupRoles.length === 0) return null;
          const isCollapsed = collapsed[group.label] ?? false;
          return (
            <div key={group.label} className="border border-cream-dark rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCollapsed(prev => ({ ...prev, [group.label]: !isCollapsed }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-cream hover:bg-cream-dark/40 text-ink transition-colors"
              >
                <span className="text-sm font-semibold uppercase tracking-wide">{group.label}</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="p-4 flex flex-col gap-2.5">
                  {groupRoles.map(roleType => {
                    const slots = roleSlots[roleType.id] ?? [];
                    const isMulti = MULTI_SLOT_KEYS.has(roleType.role_key);
                    return (
                      <div key={roleType.id} className="flex flex-col gap-2">
                        {slots.map((memberId, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-x-3 gap-y-1 items-center">
                            <label className="text-sm text-ink-mid">
                              {roleType.display_name}{isMulti && ` #${idx + 1}`}
                            </label>
                            <Select
                              value={memberId ?? ''}
                              onChange={e => updateSlot(roleType.id, idx, e.target.value || null)}
                              options={memberOptions}
                              placeholder="— Unassigned —"
                            />
                          </div>
                        ))}
                        {isMulti && (
                          <button
                            type="button"
                            onClick={() => addSlot(roleType.id)}
                            className="w-full border border-dashed border-burgundy/60 text-burgundy rounded-md py-1.5 text-sm font-medium hover:bg-burgundy/5 transition-colors"
                          >
                            + Add {roleType.display_name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

export const RoleAssignmentSection = memo(RoleAssignmentSectionImpl);
