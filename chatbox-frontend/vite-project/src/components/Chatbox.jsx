
import React, { useState } from 'react'
import axios from 'axios'
import '../styles/chatbox.css'; 

const Chatbox = () => {
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState([])
  const [file, setFile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState('')

  const sendMessage = async () => {
    try {
      const res = await axios.post('http://localhost:5000/chat', { message })
      const botResponse = res.data.response.kwargs.content
      setResponses([...responses, { message, response: botResponse }])
      setMessage('')
    } catch (error) {
      console.error(error)
    }
  }

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);  // match field name in backend
  
    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully', res.data);
    } catch (error) {
      console.error('File upload failed', error);
    }
  };  

  const queryDocuments = async () => {
    try {
      const res = await axios.post('http://localhost:5000/query', { query })
      setQueryResult(res.data.matchedDocument)
    } catch (error) {
      console.error('Failed to query documents', error)
    }
  }

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <img src="src/styles/Message Bot.png" alt="Chatbox Logo" className="chatbox-logo" />
      </div>
      <div className="chatbox-messages">
        {responses.map((res, index) => (
          <div
            key={index}
            className={`chatbox-message ${
              res.response ? 'chatbox-message-bot' : 'chatbox-message-user'
            }`}
          >
            <p><strong>{res.response ? 'Bot' : 'You'}:</strong> {res.message}</p>
            {res.response && <p>{res.response}</p>}
          </div>
        ))}
      </div>
      <div className="chatbox-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>
          <img src="src/styles/Email Send.png" alt="Send" />
        </button>
      </div>
    </div>
  );
};

export default Chatbox;