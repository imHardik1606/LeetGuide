const OutputBox = ({ guidance, isVisible, username, title = "Output" }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="bg-gray-100 rounded-lg p-6 border">
        <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
        <h4 className="font-bold text-orange-400">{username}</h4>
        <p className="text-gray-700 leading-relaxed text-sm">
          {JSON.stringify(guidance)}
        </p>
      </div>
    </div>
  );
};

export default OutputBox;
