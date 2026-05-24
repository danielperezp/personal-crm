interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'h-6 w-6 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />;
  }
  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white`}>
      {getInitials(name)}
    </div>
  );
}
