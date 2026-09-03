const InputField = ({
  label = "",
  type,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-purple-900 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-md bg-white/70 text-gray-900 placeholder-gray-500 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
};

export default InputField;
