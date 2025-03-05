// server.js
require('dotenv').config();
const express = require('express');
const next = require('next');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-lite",
  systemInstruction: "You are a professional email assistant. Your task is to generate a response email based on provided email content and specified customization options. Ensure your response is formatted as a proper email."
});

app.prepare().then(() => {
  const server = express();

  // Parse JSON bodies
  server.use(express.json());

  // API endpoint: receives an email and customization options, returns a recommended response via Gemini AI.
  server.post('/api/generate-response', async (req, res) => {
    const { email, tone, essence, pointsToInclude } = req.body;
    
    const prompt = `You are a professional email assistant tasked with writing a response to an email.
    ${(tone && tone.trim() !== "") ? `Write the response email in a ${tone} tone. ` : ""}
    ${(essence && essence.trim() !== "") ? `Make sure the essence of the response reflects this idea: ${essence}. ` : ""}
    ${(pointsToInclude && pointsToInclude.trim() !== "") ? `Make sure to cover each of these points in your response: ${pointsToInclude}. ` : ""}
    Your response must strictly conform to a standard email format.
    - Start with a salutation,
    - Follow with a blank line,
    - Provide the email content,
    - Insert another blank line,
    - End with a closing statement and signature.
    Do not add any extra commentary Do not use any bold, italic, or underlinec text.

    Here is the Email you are tasked with generating a response for:
    ${email}`;

    // Log the prompt to verify newline characters and formatting
    console.log("Generated Prompt:\n", prompt);

    try {
      const geminiResponse = await model.generateContent(prompt);
      const fullText = geminiResponse.response.text();

      res.json({ body: fullText });
    } catch (error) {
      console.error('Gemini AI error:', error);
      res.status(500).json({ error: 'Failed to generate response using Gemini AI.' });
    }
  });


  server.post('/api/regenerate-response', async (req, res) => {
    const {currentResponse, regenerateOption, tone, essence, pointsToInclude, temperature} = req.body;
    const prompt = `You are a professional email assistant tasked with refining a previously generated email response.

    Here is the previously generated response:
    ${currentResponse}

    ${regenerateOption === "shorter" ? "The user has requested a slightly shorter and more concise version of the response." : ""}
    ${regenerateOption === "longer" ? "The user has requested a slightly longer and more detailed version of the response." : ""}
    ${(tone && tone.trim() !== "") ? `Write the response email in a ${tone} tone. ` : ""}
    ${(essence && essence.trim() !== "") ? `Make sure the essence of the response reflects this idea: ${essence}. ` : ""}
    ${(pointsToInclude && pointsToInclude.trim() !== "") ? `Make sure to cover each of these points in your response: ${pointsToInclude}. ` : ""}
    Your response must strictly conform to a standard email format.
    - Start with a salutation,
    - Follow with a blank line,
    - Provide the email content,
    - Insert another blank line,
    - End with a closing statement and signature.
    Do not add any extra commentary. Do not use any bold, italic, or underlined text.`;

    console.log("Regenerate Prompt:\n", prompt);

    try {
      const geminiResponse = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              }
            ],
          }
        ],
        generationConfig: {
          temperature: temperature
        },
      });
      const fullText = geminiResponse.response.text();
      res.json({ body: fullText });
    } catch (error) {
      console.error('Gemini AI error:', error);
      res.status(500).json({ error: 'Failed to regenerate response using Gemini AI.' });
    }
  });

  // Let Next.js handle all other routes.
  server.get('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
