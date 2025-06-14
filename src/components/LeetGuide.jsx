import React, { useState } from "react";
import axios from "axios";
import InputBox from "./InputBox";
import OutputBox from "./OutputBox";

const LeetGuide = () => {
  const [username, setUsername] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = 'http://localhost:8080/api'; // Use your proxy backend
  // const API_BASE_URL = "https://alfa-leetcode-api.onrender.com";

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = async (url, retries = 3, delayMs = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios.get(url);
      } catch (err) {
        if (err.response?.status === 429 && i < retries - 1) {
          await delay(delayMs * Math.pow(2, i));
        } else {
          throw err;
        }
      }
    }
  };

  const getLeetUserData = async (username) => {
    const year = new Date().getFullYear();
    const endpoints = [
      `skillStats/${username}`,
      `userContestRankingInfo/${username}`
      //`userProfileCalendar?username=${username}&year=${year}`,
    ];

    const requests = endpoints.map((endpoint) =>
      fetchWithRetry(`${API_BASE_URL}/${endpoint}`)
    );

    const [skillRes, contestRes, calendarRes] = await Promise.all(requests);

    const calendarData = calendarRes.data.submissionCalendar || {};
    const timestamps = Object.keys(calendarData).map(
      (ts) => parseInt(ts) * 1000
    );
    const recentActivity = timestamps.filter(
      (ts) => ts >= Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    return {
      skillStats: skillRes.data,
      contestRanking: contestRes.data,
      // recentSubmissionDays: recentActivity.length,
    };
  };

  const generateGuidance = async () => {
    if (!username.trim()) {
      setError("Please enter a valid username");
      return;
    }

    const cacheKey = `leet-${username}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setGuidance(parsed.guidance);
      setShowGuide(true);
      return;
    }

    setIsLoading(true);
    setShowGuide(false);
    setError("");

    try {
      const data = await getLeetUserData(username);

      const prompt = `
You are an AI mentor helping a LeetCode user improve.

Here is the user's data:
- Skill Stats: ${JSON.stringify(data.skillStats)}
- Contest Ranking: ${JSON.stringify(data.contestRanking)}

Based on this data, provide:
1. Topics the user is strong/weak in.
2. What DSA topics they should focus more on.
3. How consistent they are — and tips for improving it.
4. Whether they need to participate in more contests.
5. Personalized improvement suggestions.
`;

      sessionStorage.setItem(cacheKey, JSON.stringify({ guidance: prompt }));
      setGuidance(prompt);
      setShowGuide(true);
    } catch (error) {
      console.error("API Error:", error);
      if (error.response?.status === 404) {
        setError("User not found. Please check the username and try again.");
      } else if (error.response?.status === 429) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setShowGuide(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">LeetGuide</h1>
          <p className="text-gray-600">
            Provide your Leetcode username, get personalized guidance 📈
          </p>
        </div>

        <InputBox
          value={username}
          onChange={setUsername}
          onSubmit={generateGuidance}
          isLoading={isLoading}
          buttonLabel={isLoading ? "Analyzing..." : "Get Guidance"}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <OutputBox
          guidance={guidance}
          isVisible={showGuide}
          username={username}
          title="Personalized Guidance"
        />

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
