const Skeleton = ({ className, variant = 'default' }) => {
  const variantClasses = {
    default: 'h-4 w-full',
    circle: 'rounded-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${variantClasses[variant]} ${className}`}
    />
  );
};

export default Skeleton;
