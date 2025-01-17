const express = require('express');
const { OpenAI } = require('openai');
const { Pinecone: PineconeClient } = require('@pinecone-database/pinecone');
const { CharacterTextSplitter } = require('langchain/text_splitter');
const { ChatOpenAI } = require('@langchain/openai');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Set up OpenAI
const configuration = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(configuration);

// Set up Pinecone
const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

// Set up langchain
const langChain = new ChatOpenAI({
  openai,
  pinecone: pineconeIndex
})

// Helper function to process PDF
const processPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Helper function to split text into chunks using CharacterTextSplitter
const splitText = async (text) => {
  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  const output = await splitter.createDocuments([text]);
  return output.map(doc => doc.pageContent); // Extract the text content from each chunk
};

// Helper function to format Pinecone results
const formatPineconeResults = (results) => {
  return results.map((result, index) => `
    [START_RESULT]
    [BOLD]Result ${index + 1}:[/BOLD] ${result.metadata.text} (Source: ${result.metadata.fileName})
    [END_RESULT]
  `).join('\n');
};

// Helper function to store text embeddings in Pinecone
const storeInPinecone = async (text, fileName) => {
  try {
    // Split text into chunks
    const chunks = await splitText(text);
    const vectors = [];

    for (const chunk of chunks) {
      // Generate embeddings using OpenAI
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Create the vector
      vectors.push({
        id: `doc-${Date.now()}-${Math.random()}`,
        values: embedding,
        metadata: { text: chunk, fileName: fileName }, // Include file name in metadata
      });
    }

    // Print vectors for debugging
    console.log('Vectors to be upserted:', JSON.stringify(vectors, null, 2));

    // Upsert in chunks
    const chunkSize = 100;
    for (let i = 0; i < vectors.length; i += chunkSize) {
      const chunk = vectors.slice(i, i + chunkSize);
      await pineconeIndex.upsert(chunk);
    }

  } catch (error) {
    console.error('Error storing in Pinecone:', error);
    throw error;
  }
};

// Helper function to query Pinecone
const queryPinecone = async (query) => {
  try {
    // Generate embeddings using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone
    const queryResponse = await pineconeIndex.query({
      topK: 5, // Number of results to return
      includeMetadata: true,
      vector: embedding,
    });

    return queryResponse.matches;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
};

// Upload document endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const text = await processPDF(file.path);

    // Store text embeddings in Pinecone
    await storeInPinecone(text, file.originalname);

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.send('File uploaded and processed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing file.');
  }
});

// Endpoint to test upserting with plain text
app.post('/test-upsert', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send('No text provided.');
  }

  try {
    // Store text embeddings in Pinecone
    await storeInPinecone(text);
    res.send('Text processed and embeddings stored successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing text.');
  }
});

// // Old Chat endpoint
// app.post('/chat', async (req, res) => {
//   const { message } = req.body;

//   try {
//     const response = await langChain.invoke(message);
//     res.json({ response });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// Endpoint to query Pinecone with plain text

app.post('/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).send('No query provided.');
  }

  try {
    // Query Pinecone
    const results = await queryPinecone(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error querying Pinecone.');
  }
});

// Chat endpoint with query
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // Query pinecone for relevant documents
    const pineconeResults = await queryPinecone(message);
    const formattedResults = formatPineconeResults(pineconeResults);

    // Integrate pinecone results into the prompt
    const prompt = `
      You have received a message from the user: "${message}". 
      Use the following information retrieved from the database to help answer the query. 
      Try to keep the answers related to Accenture Melbourne. 
      Always include the link if any.

      At the end, add: "If you have any further queries, please contact 1 (571) 434-5003".

      At the end add the source of the information and reformat the results to be user-friendly and readable. 
      Here is the relevant information retrieved from the database:

      ${formattedResults}
    `.trim();

    // Get chatbot response
    const chatResponse = await langChain.invoke(prompt);

    res.json({ 
      response: chatResponse,
      pineconeResults: pineconeResults 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// https://docs.pinecone.io/guides/data/query-data
// https://www.pinecone.io/learn/chatbots-with-pinecone/
