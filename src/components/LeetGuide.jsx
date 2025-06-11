import { useState } from "react";
import InputBox from "./InputBox";
import OutputBox from "./OutputBox";
import axios from "axios";

const LeetGuide = () => {
  const [username, setUsername] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const generateGuidance = async () => {
    setIsLoading(true);
    setShowGuide(false);
    try {
      const response = await axios.post(`https://alfa-leetcode-api.onrender.com/${username}`);
      setGuidance(response.data); // Save the response data
      setShowGuide(true);
    } catch (error) {
      setGuidance("Something went wrong. Please try again.");
      setShowGuide(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">LeetGuide</h1>
          <p className="text-gray-600">
            Provide your Leetcode username, get personalized guidance 📈
          </p>
        </div>

        {/* Input Section */}
        <InputBox
          value={username}
          onChange={setUsername}
          onSubmit={generateGuidance}
          isLoading={isLoading}
          buttonLabel={isLoading ? "Analyzing..." : "Get Guidance"}
        />

        {/* Output Section */}
        <OutputBox
          guidance={guidance} // use the guidance from state
          isVisible={showGuide}
          username={username}
          title="Guidance"
        />

        {/* Footer */}
        <div className="text-center mt-8 text-md text-gray-500">
          Made by{" "}
          <span className="text-blue-500 font-bold">
            <a
              href="https://github.com/imHardik1606"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hardik
            </a>
          </span>{" "}
          🔗
        </div>
      </div>
    </div>
  );
};

export default LeetGuide;
