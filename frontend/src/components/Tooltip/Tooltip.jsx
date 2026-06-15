import { useState } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-t-8 border-l-transparent border-l-4 border-r-transparent border-r-4 border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-b-8 border-l-transparent border-l-4 border-r-transparent border-r-4 border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-l-8 border-t-transparent border-t-4 border-b-transparent border-b-4 border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-r-8 border-t-transparent border-t-4 border-b-transparent border-b-4 border-l-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div className={`absolute ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
