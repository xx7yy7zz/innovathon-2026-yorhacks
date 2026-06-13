const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the Expo frontend can make requests
app.use(cors());

// Increase JSON payload limits because base64 image strings can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Verify that the API key is present
if (!process.env.OPENAI_API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: OPENAI_API_KEY is not defined in the environment or .env file!');
  console.error('\x1b[33m%s\x1b[0m', 'Please copy .env.example to .env and insert your OpenAI API Key.');
  process.exit(1);
}

// Initialize OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let uploadedTextbook = null;

async function parsePdfBase64(base64) {
  const pdfBuffer = Buffer.from(base64, 'base64');
  const data = await pdfParse(pdfBuffer);
  return data.text || '';
}

function cleanJsonOutput(content) {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(content.slice(start, end + 1))
  } catch {
    return null
  }
}

async function generateStudyPath(summary, bookName) {
  const prompt = `Eres un tutor experto en matemáticas. Has recibido un extracto de un libro de texto titulado "${bookName}". Genera una ruta de estudio de 4 a 6 niveles organizada de más fácil a más difícil.

Entrega SOLO un JSON válido con la siguiente estructura:
{
  "nodes": [
    { "id": "1", "label": "Nivel 1 - ...", "state": "active" },
    { "id": "2", "label": "Nivel 2 - ...", "state": "locked" },
    ...
  ]
}

Marca el primer nivel como "active" y los demás como "locked". No agregues texto adicional fuera del JSON.

Extracto del libro:
${summary}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres un asistente neutro que devuelve solo JSON válido.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 800,
  })

  const content = response.choices[0].message.content
  const parsed = cleanJsonOutput(content)
  return parsed?.nodes || null
}

function buildTextbookContext() {
  if (!uploadedTextbook) return '';
  return `El estudiante cargó un libro de texto: "${uploadedTextbook.name}".
Usa su contenido en todas las respuestas cuando sea relevante.

Extracto disponible del libro:
${uploadedTextbook.summary}

Si el estudiante pide ayuda con un ejercicio o tema, relaciónalo con el contenido del libro.`;
}

// The core SAT Tutor API endpoint
app.post('/api/explain', async (req, res) => {
  const { text, image, file, history, topic } = req.body;

  try {
    let pathNodes = null;
    if (file && file.type === 'application/pdf' && file.data) {
      const extractedText = await parsePdfBase64(file.data);
      const summary = extractedText.length > 12000 ? extractedText.slice(0, 12000) : extractedText;
      const nodes = await generateStudyPath(summary, file.name);
      uploadedTextbook = {
        name: file.name,
        text: extractedText,
        summary,
        pathNodes: nodes,
      };
      pathNodes = nodes
    }
    // Sistema de prompt en español para EstudiaAmigo AI - Enfoque Feynman y Socrático
    const systemPrompt = `Eres EstudiaAmigo AI, un tutor experto en matemáticas e inteligencia artificial. Tu misión es asegurar el aprendizaje real y profundo mediante un ciclo de "Enseñanza -> Reto Feynman -> Evaluación Socrática", aplicable a cualquier nivel de estudio.

${buildTextbookContext()}

Dependiendo de la interacción del estudiante, DEBES seguir este flujo exacto:

**FASE 1: ENSEÑANZA Y RETO (Cuando el estudiante envía un problema nuevo)**
1. **El Desglose:** Proporciona una explicación clara, lógica y paso a paso para resolver el problema. No te limites a dar la respuesta final; enseña el "por qué".
2. **El Reto Feynman (¡CRÍTICO!):** Al final de tu explicación, no te despidas simplemente. Lanza una pregunta de seguimiento desafiando al estudiante a que te explique el concepto central con sus propias palabras. 
*(Ejemplo: "Ahora, para asegurarnos de que esto quedó claro, explícame con tus propias palabras por qué tuvimos que igualar la ecuación a cero en el paso 2").*

**FASE 2: EVALUACIÓN SOCRÁTICA (Cuando el estudiante responde a tu reto)**
1. Tu función ahora NO es darle la solución directa si se equivoca. Evalúa su explicación críticamente utilizando el Método Socrático.
2. Si su explicación tiene errores, es vaga o superficial: Señala amablemente el área confusa y haz 1 o 2 preguntas guía estratégicas para forzarlo a detectar y corregir su propio error lógico.

**FASE 3: APROBACIÓN (Cuando el estudiante demuestra dominio total)**
1. Si la explicación del alumno al Reto Feynman es completamente correcta y demuestra comprensión real:
2. Felicítalo por su excelente esfuerzo.
3. DEBES incluir al final de tu respuesta de manera exacta la palabra clave: [TEMA_APROBADO] (la cual utilizará el sistema para registrar su progreso).

REGLAS DE SEGURIDAD (GUARDRAILS):
- Cíñete exclusivamente al estudio de las matemáticas. Si el estudiante desvía la conversación, reajústalo amablemente al área de estudio activo.
- Evita alucinaciones. Prioriza la precisión matemática absoluta.

FORMATO Y TONO:
- Tu tono es directo, alentador y socrático.
- Escribe SIEMPRE en español.
- Mantén tus párrafos muy cortos para facilitar la lectura.
- Usa texto en negrita para enfatizar conceptos clave.
- DEBES formatear todas las variables, ecuaciones y números usando LaTeX estándar: usa \`$\` para matemáticas en línea (ej. \`$y = mx + b$\`) y \`$$\` para ecuaciones en bloque.`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Agregar el historial de la conversación si existe
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          // Filtrar el mensaje de bienvenida inicial para evitar redundancia
          if (msg.id !== 'welcome' && msg.content) {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        }
      });
    }

    // Agregar el mensaje actual del usuario
    const contentPayload = [];
    contentPayload.push({
      type: 'text',
      text: text && text.trim() !== '' ? text : `Por favor, evalúa mi explicación sobre el tema de ${topic || 'Matemáticas'}.`,
    });

    if (image) {
      contentPayload.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${image}`,
        },
      });
    }

    messages.push({
      role: 'user',
      content: contentPayload,
    });

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1000,
    });

    const explanation = response.choices[0].message.content;
    res.json({ explanation, pathNodes: pathNodes || uploadedTextbook?.pathNodes || null });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to generate tutor explanation' });
  }
});

app.listen(PORT, () => {
  console.log(`SnapPrep Backend server running on port ${PORT}`);
});