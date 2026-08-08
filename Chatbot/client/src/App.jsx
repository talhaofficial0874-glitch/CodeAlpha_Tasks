import { useState, useRef, useEffect } from 'react'
import './index.css'

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=a855f7";
const USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=6366f1";

function getTimestamp() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 I'm your professional AI assistant. How can I help you today?", sender: 'bot', time: getTimestamp() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    setMessages(prev => [...prev, { text: userMessage, sender: 'user', time: getTimestamp() }]);
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot', time: getTimestamp() }]);
      }, 600 + Math.random() * 500);

    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: "Oops! I'm having trouble connecting to the backend.", sender: 'bot', time: getTimestamp() }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        
        <div className="chat-header">
          <div className="header-info">
            <div className="avatar">
              <img src={BOT_AVATAR} alt="Bot Avatar" />
              <div className="status-indicator"></div>
            </div>
            <div className="title-container">
              <h2>Support Assistant</h2>
              <p>Typically replies instantly</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn">⋮</button>
            <button className="action-btn">✕</button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}-wrapper`}>
              <img src={msg.sender === 'bot' ? BOT_AVATAR : USER_AVATAR} alt={msg.sender} className="message-avatar" />
              <div className="message-content">
                <div className={`message ${msg.sender}-message`}>
                  {msg.text}
                </div>
                <span className="timestamp">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-wrapper bot-wrapper">
              <img src={BOT_AVATAR} alt="bot" className="message-avatar" />
              <div className="message-content">
                <div className="typing-wrapper">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrapper">
          <div className="chat-input-container">
            <button className="attach-btn" style={{fontSize:'1.2rem', paddingBottom:'2px'}}>📎</button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..." 
              autoComplete="off"
            />
            <button onClick={handleSend} className="send-btn">
              <span style={{transform: "rotate(0deg)", marginLeft: "-2px", marginTop: "1px"}}>➤</span>
            </button>
          </div>
          <div className="branding">Powered by <span>AI</span></div>
        </div>

      </div>
    </div>
  )
}

export default App
