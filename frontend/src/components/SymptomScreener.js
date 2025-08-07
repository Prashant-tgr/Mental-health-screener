import React from 'react';

const SymptomScreener = ({ onStart }) => {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Symptom Screener</h2>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
        A quick way to check in on your mental state.
      </p>
      <p style={{ fontSize: '14px', margin: '15px 0', color: '#444' }}>
        Answer a few questions to get an overview of your current stress and anxiety levels.
      </p>
      <button 
        onClick={onStart}
        style={{
          background: '#a78bfa',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          cursor: 'pointer'
        }}
      >
        Take Screener →
      </button>
    </div>
  );
};

export default SymptomScreener;
