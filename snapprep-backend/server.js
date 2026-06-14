const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const PDFParser = require("pdf2json"); // Swapped to the stable library
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

// NEW BULLETPROOF PDF PARSER
async function parsePdfBase64(base64) {
  return new Promise((resolve, reject) => {
    try {
      const pdfBuffer = Buffer.from(base64, 'base64');
      const pdfParser = new PDFParser(this, 1); // 1 = extract raw text

      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        const extractedText = pdfParser.getRawTextContent();
        resolve(extractedText || '');
      });

      pdfParser.parseBuffer(pdfBuffer);
    } catch (error) {
      reject(error);
    }
  });
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
  const prompt = `Eres un tutor experto en matemáticas. Has recibido un extracto del libro "${bookName}".
  
Misión crítica para el sistema: Debes generar una ruta de estudio de EXACTAMENTE 6 niveles. 
REGLA ESTRICTA: Debes alternar un tema de Fracciones y un tema de Geometría basándote en el contenido del libro.

Sigue esta estructura obligatoria de menor a mayor dificultad:
- Nivel 1: Tema básico de Fracciones (ej. Conceptos generales).
- Nivel 2: Tema básico de Geometría (ej. Clasificando triángulos).
- Nivel 3: Tema intermedio de Fracciones.
- Nivel 4: Tema intermedio de Geometría.
- Nivel 5: Tema avanzado de Fracciones.
- Nivel 6: Tema avanzado de Geometría.

Entrega SOLO un JSON válido con la siguiente estructura:
{
  "nodes": [
    { "id": "1", "label": "Fracciones: [Nombre Tema]", "state": "active" },
    { "id": "2", "label": "Geometría: [Nombre Tema]", "state": "locked" },
    { "id": "3", "label": "Fracciones: [Nombre Tema]", "state": "locked" },
    { "id": "4", "label": "Geometría: [Nombre Tema]", "state": "locked" },
    { "id": "5", "label": "Fracciones: [Nombre Tema]", "state": "locked" },
    { "id": "6", "label": "Geometría: [Nombre Tema]", "state": "locked" }
  ]
}

No agregues texto adicional fuera del JSON.

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
  
  const niveles = uploadedTextbook.pathNodes 
    ? uploadedTextbook.pathNodes.map(n => n.label).join(', ') 
    : 'conceptos básicos';

  return `[CONTEXTO DEL SISTEMA]: 
El estudiante acaba de cargar el libro de texto: "${uploadedTextbook.name}".
Ruta de estudio generada: ${niveles}.

[INSTRUCCIÓN CRÍTICA PARA TU PRIMERA RESPUESTA]: 
1. Confirma con entusiasmo que has analizado el libro.
2. Anuncia cuál es el primer tema de la ruta (Nivel 1).
3. Ponle un problema de práctica MUY SENCILLO sobre ese tema y pídele SOLO su respuesta final (el número). NO le pidas que explique nada todavía.

Extracto del libro de referencia:
${uploadedTextbook.summary}`;
}

// The core SAT Tutor API endpoint
app.post('/api/explain', async (req, res) => {
  const { text, image, file, history, topic } = req.body;

  try {
    let pathNodes = null;
    if (file && file.type === 'application/pdf' && file.data) {
      const extractedText = await parsePdfBase64(file.data);
      const summary = extractedText.length > 80000 ? extractedText.slice(0, 80000) : extractedText; // Aumentado a 80k
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
    // Sistema de prompt actualizado para EstudiaAmigo AI
    const systemPrompt = `Eres EstudiaAmigo AI, un tutor experto en matemáticas. Tu misión es asegurar el aprendizaje profundo.

TEMA ACTUAL BAJO ESTUDIO: ${topic || 'Matemáticas'}

${buildTextbookContext()}

MÁQUINA DE ESTADOS DEL TUTOR (DEBES SEGUIR ESTE FLUJO):

**FASE 0: DIAGNÓSTICO (Inicio)**
- Presenta el problema. Pide SOLO la respuesta final.

**FASE 1: RETO FEYNMAN (Tras la respuesta del estudiante)**
- Si es CORRECTA: Felicítalo y pídele que explique paso a paso CÓMO llegó a la respuesta (Reto Feynman).
- Si es INCORRECTA: Explica el error, da la solución y lanza el Reto Feynman sobre el concepto clave.

**FASE 2: EVALUACIÓN SOCRÁTICA**
- Evalúa la lógica del estudiante. Si es vaga, haz preguntas guía. No des la respuesta.

**FASE 3: APROBACIÓN Y TRANSICIÓN AL SIGUIENTE NIVEL**
- Si la explicación es correcta: Felicítalo, incluye la palabra clave [TEMA_APROBADO] e INMEDIATAMENTE en el mismo mensaje inicia la transición al siguiente nivel, el cual es Geometría (Nivel 2 de la ruta si se cargó un libro, o Nivel 4 en la ruta por defecto).
- Al transicionar a Geometría en este mismo mensaje, debes hacer la primera pregunta del tema de Geometría comparando un triángulo y un círculo, generando dos opciones visuales (Opción A y Opción B) usando bloques de código SVG:
  - Opción A: Dibuja un triángulo usando un elemento <polygon> con un color llamativo y armonioso (por ejemplo, verde esmeralda o naranja) dentro de un bloque \`\`\`svg ... \`\`\`.
  - Opción B: Dibuja un círculo usando un elemento <circle> con otro color armonioso (por ejemplo, azul o violeta) dentro de un bloque \`\`\`svg ... \`\`\`.
  - Haz una pregunta socrática o creativa sobre estas figuras (por ejemplo, cuál de ellas no tiene vértices, o cuál tiene tres lados) y pide al usuario que responda cuál es la opción correcta (Opción A u Opción B). No pidas explicaciones Feynman en esta transición, solo que elijan la opción correcta.

**FASE 4: MODO GEOMETRÍA (Prioridad)**
- Si el tema es geometría, IGNORA el formato de texto estándar.
- DEBES generar DOS opciones visuales (Opción A y Opción B) usando código SVG. Si el usuario pide un triángulo o un círculo, dibuja el diagrama usando un bloque de código SVG con <polygon> o <circle>.
- Formato:
  1. Pregunta.
  2. Opción A (en bloque \`\`\`svg ... \`\`\`).
  3. Opción B (en bloque \`\`\`svg ... \`\`\`).
  4. Pregunta final: "¿Cuál es la respuesta correcta?"
- Devuelve SOLO el código SVG dentro del bloque, sin HTML extra.
- IMPORTANTE: No pidas explicaciones Feynman mientras estés en este modo visual. Espera a que el usuario elija A o B.

REGLAS:
- Tono: Directo, alentador, socrático.
- Idioma: SIEMPRE en español.
- Formato: Párrafos cortos, **negrita** en conceptos, LaTeX para mates ($x=7$ o $$x=7$$).
- Todas las expresiones matemáticas deben ir dentro de delimitadores de LaTeX: "$ ... $" para inline y "$$ ... $$" para display.
- No uses comandos TeX sueltos como \frac{1}{4} fuera de un bloque de delimitadores.
- **No incluyas texto explicativo fuera de los bloques de código cuando generes SVGs, solo el código dentro del bloque.**
`;

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

    // Actualizar el estado de los nodos en el backend si el tema fue aprobado
    if (explanation.includes("[TEMA_APROBADO]") && uploadedTextbook && uploadedTextbook.pathNodes) {
      const activeIndex = uploadedTextbook.pathNodes.findIndex((n) => n.state === "active");
      if (activeIndex !== -1) {
        uploadedTextbook.pathNodes[activeIndex].state = "completed";
        if (activeIndex + 1 < uploadedTextbook.pathNodes.length) {
          uploadedTextbook.pathNodes[activeIndex + 1].state = "active";
        }
      }
    }

    res.json({ explanation, pathNodes: pathNodes || null });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to generate tutor explanation' });
  }
});

app.listen(PORT, () => {
  console.log(`SnapPrep Backend server running on port ${PORT}`);
});