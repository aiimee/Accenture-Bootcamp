// react is a javascript library for building user interfaces
// usestate is a react HOOK, lets you add state to functional components
import React, { useState } from 'react'
// axios is a promise-based HHTTP client for making requests to the backend server
import axios from 'axios'

// this defines a functional component named Chatbox
const Chatbox = () => {
    /*
    here we are declaring state variables that will be updated
    the 'message' variable would hold the current message typed by the user
    then the setMessage is the function to update the 'message' state
    */
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState([])

  const sendMessage = async () => {
    try {
      const res = await axios.post('http://localhost:5000/chat', { message })
      // extract the bot response from the content that was received(ik this should be done on backend)
      const botResponse = res.data.response.kwargs.content 
      setResponses([...responses, { message, response: botResponse }])
      setMessage('')
    } catch (error) {
      console.error(error)
    }
  }

  // here we return the rendered component to whichever page uses it
  return (
    <div>
      <h1>Chatbox</h1>
      <div>
        {/* iterates over the response array to display each message and bot response */}
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
    </div>
  )
}

export default Chatbox
