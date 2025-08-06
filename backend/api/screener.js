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
      console.warn("No JSON found in Gemini response. Sending raw text.");
      return res.json({ advice: rawResponse });
    }

    let structuredResponse;
    try {
      structuredResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.json({ advice: rawResponse });
    }

    res.json(structuredResponse);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Error analyzing screener results." });
  }
});
