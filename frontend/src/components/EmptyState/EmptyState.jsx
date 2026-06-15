import { Package, Users, FileText, AlertCircle } from 'lucide-react';

const EmptyState = ({ icon, title, description, action, actionText }) => {
  const icons = {
    package: Package,
    users: Users,
    fileText: FileText,
    alert: AlertCircle,
  };

  const Icon = icon ? icons[icon] || Package : Package;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <button onClick={action} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
