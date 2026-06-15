const Textarea = ({ label, error, helperText, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`input ${error ? 'border-danger-500 focus:ring-danger-500' : ''}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Textarea;
