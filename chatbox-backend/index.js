const express = require('express')
const { OpenAI } = require('openai')
const { Pinecone: PineconeClient } = require('@pinecone-database/pinecone')
// const { Chain } = require('langchain/chains');
const { ChatOpenAI } = require('@langchain/openai')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())

// Use CORS middleware
app.use(cors())

// Set up OpenAI
const configuration = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAI(configuration)

// Set up Pinecone
// const pinecone = new PineconeClient({
//   apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT,
// });
const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY })
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX)

// Set up langchain
const langChain = new ChatOpenAI({
  openai,
  pinecone: pineconeIndex
})

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message } = req.body

  try {
    const response = await langChain.invoke(message)
    res.json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
