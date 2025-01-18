const Input = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-sky-500 bg-opacity-50 rounded-lg border 
        border-sky-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400 placeholder-sky-300 transition duration-200"
      />
    </div>
  );
};
export default Input;
