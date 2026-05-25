import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-14 h-14 text-[22px]',
} as const;

interface AvatarProps {
  name: string | null | undefined;
  size?: keyof typeof SIZE_CLASSES;
}

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(part => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-burgundy text-white font-serif shrink-0',
        SIZE_CLASSES[size],
      )}
    >
      {initials(name)}
    </span>
  );
}
