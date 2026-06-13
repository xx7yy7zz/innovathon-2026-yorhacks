const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the Expo frontend can make requests
app.use(cors());

// Increase JSON payload limits because base64 image strings can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The core SAT Tutor API endpoint
app.post('/api/explain', async (req, res) => {
  const { text, image } = req.body;

  try {
    // Structural system prompt to enforce SAT pedagogical strategy
   const systemPrompt = `You are a world-class, highly sought-after SAT Math Tutor. Your tone is punchy, deeply strategic, encouraging, and focused on how to BEAT the test. Do not sound like a dry, boring textbook.

When given a problem (via text, image, or both), you MUST use the following exact structure:

**Domain:** [Identify the SAT Math category, e.g., Passport to Advanced Math]

**1. The Fast Path (Test-Taking Strategy)**
Explain the absolute fastest, sneakiest way to get the answer. Prioritize tricks like "Plugging in Numbers", "Backsolving" (testing answer choices), or checking extreme values (like x=0 or x=-100). How do we solve this in 10 seconds?

**2. The Mathematical Breakdown**
Provide the traditional algebraic solution, but keep it concise and punchy. Walk through the logic step-by-step.

**3. The Trap Answers**
Explicitly call out WHY the test makers designed the wrong answers. (e.g., "Choice A is the most common trap because it's the y-intercept...").

CRITICAL FORMATTING RULES:
- Keep paragraphs very short for readability.
- Use bold text heavily to emphasize key concepts.
- You MUST enclose ALL math equations, variables, and numbers in backticks (e.g., \`y = 1.8^x + 1\` or \`x = 5\`). Do NOT use LaTeX ($ or $$). This ensures the math renders perfectly in the user's UI.`;

    const contentPayload = [];

    // Add text prompt if provided, otherwise default to a catch-all instruction
    contentPayload.push({
      type: 'text',
      text: text && text.trim() !== '' ? text : 'Please analyze and break down this SAT math problem step-by-step.',
    });

    // Append the base64 image if it exists in the request
    if (image) {
      contentPayload.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${image}`,
        },
      });
    }

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contentPayload },
      ],
      max_tokens: 1000,
    });

    const explanation = response.choices[0].message.content;
    res.json({ explanation });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to generate tutor explanation' });
  }
});

app.listen(PORT, () => {
  console.log(`SnapPrep Backend server running on port ${PORT}`);
});