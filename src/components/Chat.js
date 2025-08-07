import React, { useState } from 'react';
import axios from 'axios';

function Chat({ onSentiment }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { message: input });
      const { reply, mood } = res.data; // updated from sentiment → mood

      const botMessage = { role: 'bot', text: reply };
      setMessages((prev) => [...prev, botMessage]);

      // Send mood to parent (dashboard)
      if (onSentiment) {
        onSentiment(mood || 'neutral');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Error connecting to AI. Please try again later.' }
      ]);
    }

    setLoading(false);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && <p className="bot">AI is typing...</p>}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
