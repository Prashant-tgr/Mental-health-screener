import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import SymptomScreener from './components/SymptomScreener';
import ScreenerPage from './components/ScreenerPage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [moodTrend, setMoodTrend] = useState([])
  const [input, setInput] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showScreener, setShowScreener] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { message: input });
      const botMessage = { sender: 'bot', text: response.data.reply };
      
      setMessages(prev => [...prev, botMessage]);
      setMoodHistory(prev => [...prev, response.data.mood]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to server.' }]);
    }

    setInput('');
  };

  const moodData = {
    labels: moodHistory.map((_, index) => `Msg ${index + 1}`),
    datasets: [
      {
        label: 'Mood Trend',
        data: moodHistory.map(mood => (mood === 'positive' ? 1 : mood === 'neutral' ? 0 : -1)),
        borderColor: 'blue',
        backgroundColor: 'lightblue',
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Mental Health Support</h1>

      {showScreener ? (
        <ScreenerPage onBack={() => setShowScreener(false)} />
      ) : (
        <>
          <SymptomScreener onStart={() => setShowScreener(true)} />

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', height: '400px', overflowY: 'auto', marginTop: '20px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}
              >
                <span 
                  style={{ 
                    background: msg.sender === 'user' ? '#007bff' : '#f1f1f1', 
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    padding: '8px 12px', 
                    borderRadius: '12px',
                    display: 'inline-block'
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '10px', display: 'flex' }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..." 
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
            <button 
              onClick={sendMessage} 
              style={{ marginLeft: '8px', padding: '10px 20px', border: 'none', background: '#007bff', color: '#fff', borderRadius: '4px' }}
            >
              Send
            </button>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h2>Mood Trend</h2>
            <Line data={moodData} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
