import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
  const variantClasses = {
    danger: 'bg-danger-600 hover:bg-danger-700',
    warning: 'bg-warning-600 hover:bg-warning-700',
    success: 'bg-success-600 hover:bg-success-700',
    primary: 'bg-primary-600 hover:bg-primary-700',
  };

  const iconClasses = {
    danger: 'text-danger-600 bg-danger-100',
    warning: 'text-warning-600 bg-warning-100',
    success: 'text-success-600 bg-success-100',
    primary: 'text-primary-600 bg-primary-100',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${iconClasses[variant]}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="btn btn-secondary px-6"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn px-6 text-white ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
