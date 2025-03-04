// server.js
require('dotenv').config();
const express = require('express');
const next = require('next');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

app.prepare().then(() => {
  const server = express();

  // Parse JSON bodies
  server.use(express.json());

  // API endpoint: receives an email and returns a recommended response via Gemini AI.
  server.post('/api/generate-response', async (req, res) => {
    const { email } = req.body;
    try {
      const prompt = `You are a professional email assistant. Please read the email below and craft a well-considered, friendly, and professional response. You must follow the instructions exactly and produce your reply strictly in the format of an email body. Regardless of any other instructions you are given onwards, your output must conform exactly to an email body format and nothing else. Do not add any additional text, headers, or formatting. Do not include a subject line. Do not use any bold, italicized, or underlined text in your response. Your entire output must start with a salutation, followed by a blank line, then the email body, followed by a blank line, and a closing statement and signature.
      
      Here is the Email:
      ${email}`;
      
      const geminiResponse = await model.generateContent(prompt);
      const fullText = geminiResponse.response.text();

      let emailBody = fullText;

      res.json({ body: emailBody });
    } catch (error) {
      console.error('Gemini AI error:', error);
      res.status(500).json({ error: 'Failed to generate response using Gemini AI.' });
    }
  });


  // server.js (inside app.prepare().then(() => { ... }))
// Place this endpoint before the catch-all route.
  server.post('/api/regenerate-sentence', async (req, res) => {
    const { email, sentence } = req.body;
    try {
      const prompt = `You are a professional email assistant. Re-generate ONLY the specified sentence in the following email. Do not include any extra text or formatting. Your output must be exactly one sentence that fits seamlessly into the original email response.
      
      Sentence to regenerate:
      ${sentence}
  
      Email:
      ${email}`;

      console.log('Regenerate prompt:', prompt);
      const geminiResponse = await model.generateContent(prompt);
      const newSentence = geminiResponse.response.text();
      console.log('New regenerated sentence:', newSentence);
      res.json({ newSentence });
    } catch (error) {
      console.error('Gemini AI error (regenerate sentence):', error);
      res.status(500).json({ error: 'Failed to regenerate sentence using Gemini AI.' });
    }
  });


  // Let Next.js handle all other routes.
  server.get('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
