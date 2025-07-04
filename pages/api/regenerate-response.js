import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-lite",
  systemInstruction: "You are a professional email assistant. Your task is to generate a response email based on provided email content and specified customization options. Ensure your response is formatted as a proper email."
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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
}