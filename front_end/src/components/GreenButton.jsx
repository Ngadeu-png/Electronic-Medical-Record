export const GreenButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      {children}
    </button>
  );
};

export const RedButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      {children}
    </button>
  );
};