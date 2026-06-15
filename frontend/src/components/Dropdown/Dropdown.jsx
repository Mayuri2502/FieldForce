import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${alignClasses[align]}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ children, onClick, danger = false, disabled = false }) => {
  return (
    <button
      onClick={() => {
        onClick?.();
      }}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
        danger ? 'text-danger-600 hover:bg-danger-50' : 'text-gray-700 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200" />;
};

export { Dropdown, DropdownItem, DropdownDivider };
