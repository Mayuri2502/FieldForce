const Avatar = ({ src, alt, initials, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const bgColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const getBgColor = (name) => {
    if (!name) return bgColors[4]; // Default to blue
    const index = name.charCodeAt(0) % bgColors.length;
    return bgColors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${getBgColor(
        alt || initials
      )} ${className}`}
    >
      {initials || alt?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default Avatar;
