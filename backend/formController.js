const OpenAI = require("openai");
const Ajv = require("ajv");
const { v4: uuidv4 } = require('uuid');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const ajv = new Ajv();

const SYSTEM_PROMPT = `
You are an AI Form Architect. 
STRICT RULES:
1. If the prompt is specific, output ONLY a valid JSON Schema Draft 7.
2. If the prompt is ambiguous (e.g., "Make a form for booking a meeting room"), return this EXACT JSON:
   {
     "status": "clarification_needed",
     "questions": ["Question 1?", "Question 2?"]
   }
3. NO MARKDOWN. NO BACKTICKS. Raw JSON only.
`;

exports.generateForm = async (req, res) => {
  const { prompt, history, currentSchema, conversationId, version = 1 } = req.body;
  
  // Requirement #6: Support for mock failure query parameters
  let mockFailuresRemaining = parseInt(req.query.mock_llm_failure) || 0;
  let attempts = 0;
  const MAX_ATTEMPTS = 3; // 1 initial + 2 retries

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      let aiOutput;

      // Logic to simulate failure for verification
      if (mockFailuresRemaining > 0) {
        console.log(`Simulating failure... Attempt: ${attempts}`);
        aiOutput = { invalid_schema: true, type: "not-a-type" }; // Invalid JSON Schema
        mockFailuresRemaining--;
      } else {
        const chatCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(history || []).map(m => ({ 
              role: m.role === 'user' ? 'user' : 'assistant', 
              content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) 
            })),
            { role: "user", content: `Current Schema: ${JSON.stringify(currentSchema || {})}\n\nRequest: ${prompt}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        aiOutput = JSON.parse(chatCompletion.choices[0].message.content);
      }

      // 1. Check for Clarification Request (Requirement #5)
      if (aiOutput.status === "clarification_needed") {
        return res.status(200).json({
          status: "clarification_needed",
          conversationId: conversationId || uuidv4(),
          questions: aiOutput.questions
        });
      }

      // 2. Validate against JSON Schema Meta-schema (Requirement #6)
      const isSchemaValid = ajv.validateSchema(aiOutput);
      
      if (isSchemaValid) {
        return res.status(200).json({
          formId: conversationId || uuidv4(),
          version: version + 1,
          schema: aiOutput
        });
      } else {
        console.warn(`Attempt ${attempts}: Invalid schema. Retrying...`);
        if (attempts >= MAX_ATTEMPTS) throw new Error("Retry limit reached");
      }

    } catch (error) {
      if (attempts >= MAX_ATTEMPTS) {
        // Requirement #6: Return 500 error after all retries fail
        return res.status(500).json({ 
          error: "Failed to generate valid schema after multiple attempts." 
        });
      }
      console.error(`Attempt ${attempts} error:`, error.message);
    }
  }
};
