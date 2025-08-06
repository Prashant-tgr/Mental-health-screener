import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const analyzeSentimentWithGemini = async (message) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: {
            text: `Analyze the sentiment of this message and return in JSON with fields: {sentiment: "positive|neutral|negative", explanation: "..."}:\n\n${message}`,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.candidates?.[0]?.output) {
      return JSON.parse(data.candidates[0].output); // Parse Gemini's JSON output
    }

    return { sentiment: 'neutral', explanation: 'No sentiment detected.' };
  } catch (error) {
    console.error('Error analyzing sentiment with Gemini:', error);
    return { sentiment: 'neutral', explanation: 'Analysis failed.' };
  }
};
