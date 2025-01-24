import PropTypes from "prop-types";

const Select = ({ icon: Icon, options, value, onChange }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5" />
      </div>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-3 py-2 bg-sky-500 bg-opacity-50 rounded-lg border
          border-sky-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400
          text-sky-100 transition duration-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

Select.propTypes = {
  icon: PropTypes.elementType.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Select;
