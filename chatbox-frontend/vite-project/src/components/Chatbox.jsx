import React, { useState } from 'react'
import axios from 'axios'

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
    <div>
      <h1>Chatbox</h1>
      <div>
        {responses.map((res, index) => (
          <div key={index}>
            <p><strong>You:</strong> {res.message}</p>
            <p><strong>Bot:</strong> {res.response}</p>
          </div>
        ))}
      </div>
      <input
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Type a message'
      />
      <button onClick={sendMessage}>Send</button>
      <input type='file' onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload Document</button>
      <input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Query the document'
      />
      <button onClick={queryDocuments}>Query Documents</button>
      <div>
        <h3>Query Result:</h3>
        <pre>{queryResult}</pre>
      </div>
    </div>
  )
}

export default Chatbox
