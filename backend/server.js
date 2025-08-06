import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// POST: Chat endpoint
// POST: Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required." });

  const prompt = `
    You are a supportive mental health assistant.
    The user said: "${message}"

    1. Provide a helpful reply.
    2. Analyze the user's message and return their mood as one of: "happy", "neutral", "sad", "stressed", "anxious".

    Return ONLY valid JSON:
    {
      "reply": "Your empathetic reply",
      "mood": "happy | neutral | sad | stressed | anxious"
    }
  `;

  try {
    const result = await model.generateContent([prompt]);
    const rawResponse = result.response?.text();

    if (!rawResponse) {
      return res.status(500).json({ reply: "Error processing your request.", mood: "neutral" });
    }

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ reply: "I'm here to listen. How are you feeling right now?", mood: "neutral" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "Error processing your request.", mood: "neutral" });
  }
});


// POST: Screener endpoint
app.post('/api/screener', async (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Answers are required." });
  }

  const prompt = `
    The user completed a mental health screener with these answers:
    ${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

    Return ONLY valid JSON (no explanations, no extra text) in this format:
    {
      "stressLevel": "low | moderate | high",
      "observations": ["observation1", "observation2"],
      "advice": ["step1", "step2", "step3"]
    }
  `;

  try {
    const result = await model.generateContent([prompt]);
    let rawResponse = result.response?.text();

    if (!rawResponse) {
      return res.status(500).json({ error: "No response from Gemini API." });
    }

    // Extract valid JSON if extra text is included
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in Gemini response. Sending fallback advice.");
      return res.json({
        stressLevel: "moderate",
        observations: ["Unable to parse structured data."],
        advice: ["Try stress-relief exercises", "Maintain a routine", "Consider seeking professional help if needed"]
      });
    }

    let structuredResponse;
    try {
      structuredResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.json({
        stressLevel: "moderate",
        observations: ["Unable to parse Gemini response."],
        advice: ["Stay positive", "Follow healthy habits", "Reach out for support if necessary"]
      });
    }

    res.json(structuredResponse);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      stressLevel: "moderate",
      observations: ["Gemini API failed to process the request."],
      advice: ["Try relaxation techniques", "Get adequate sleep", "Seek help if symptoms persist"]
    });
  }
});

app.listen(5000, () => console.log('✅ Server running on port 5000'));
