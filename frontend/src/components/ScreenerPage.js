import React, { useState } from 'react';
import axios from 'axios';


const questions = [
  "How often have you felt stressed in the past week?",
  "How often have you felt anxious in the past week?",
  "How well have you been sleeping?",
  "How often do you feel overwhelmed by tasks?"
];

const ScreenerPage = ({ onBack }) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL;


  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (answers.includes("")) {
      alert("Please answer all questions.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/screener`, { answers });

      if (response.data.stressLevel) {
        setResult(response.data); // Expecting { stressLevel, observations, advice }
      } else {
        setResult({ error: "Unable to generate structured advice. Showing raw response.", raw: response.data.advice || "No advice received." });
      }
    } catch (error) {
      console.error(error);
      setResult({ error: "Error generating personalized advice." });
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }}>
      <h2>Mental Health Screener</h2>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '12px' }}>
          <p>{q}</p>
          <select
            value={answers[i]}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Select an option</option>
            <option value="Never">Never</option>
            <option value="Sometimes">Sometimes</option>
            <option value="Often">Often</option>
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', marginTop: '10px', width: '100%' }}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {result && (
        <div style={{ marginTop: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
          <h4>Personalized Advice</h4>
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <>
              <p><strong>Stress Level:</strong> {result.stressLevel}</p>
              <p><strong>Key Observations:</strong></p>
              <ul>
                {result.observations.map((obs, index) => (
                  <li key={index}>{obs}</li>
                ))}
              </ul>
              <p><strong>Advice:</strong></p>
              <ul>
                {result.advice.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <button
        onClick={onBack}
        style={{ background: '#ccc', color: 'black', border: 'none', padding: '8px', borderRadius: '6px', marginTop: '10px', width: '100%' }}
      >
        Back to Chat
      </button>
    </div>
  );
};

export default ScreenerPage;


