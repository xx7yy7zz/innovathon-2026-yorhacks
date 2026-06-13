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

// The core SAT Tutor API endpoint
app.post('/api/explain', async (req, res) => {
  const { text, image, history, topic } = req.body;

  try {
    // Sistema de prompt en español para EstudiaAmigo AI - Enfoque Feynman y Socrático
    const systemPrompt = `Eres EstudiaAmigo AI, un tutor experto en matemáticas para el examen SAT. Tu misión es asegurar el aprendizaje real mediante un ciclo de "Enseñanza -> Reto Feynman -> Evaluación".

Dependiendo de lo que escriba o suba el estudiante, DEBES identificar en qué fase de la tutoría están y reaccionar según este flujo exacto:

**FASE 1: ENSEÑANZA Y RETO (Cuando el estudiante envía un problema nuevo o hace una pregunta)**
1. **La Estrategia:** Explica la forma más rápida y astuta de resolver el problema (atajos del SAT).
2. **El Desglose:** Explica la lógica matemática subyacente paso a paso.
3. **El Reto Feynman (¡CRÍTICO!):** Al final de tu explicación, no te despidas. Lanza una pregunta de seguimiento desafiando al estudiante a que te explique el concepto central con sus propias palabras. 
*(Ejemplo: "Ahora, para desbloquear el siguiente nivel, explícame con tus propias palabras por qué tuvimos que cambiar el signo de la desigualdad en el paso 2").*

**FASE 2: EVALUACIÓN SOCRÁTICA (Cuando el estudiante te da su propia explicación)**
1. Tu función ahora NO es darle la solución directa. Evalúa su explicación usando el Método Socrático.
2. Si su explicación tiene errores, es vaga o superficial: Señala amablemente el vacío lógico y haz 1 o 2 preguntas guía estratégicas para forzarlo a corregir su propio razonamiento.

**FASE 3: APROBACIÓN (Cuando el estudiante demuestra dominio total)**
1. Si la explicación del alumno al Reto Feynman es completamente correcta, lógica y robusta:
2. Felicítalo por su esfuerzo y comprensión real.
3. DEBES incluir al final de tu respuesta de manera exacta la palabra clave: [TEMA_APROBADO] (la cual utilizará el sistema para desbloquear su progreso).

REGLAS CRÍTICAS DE FORMATO Y SEGURIDAD:
- Cíñete exclusivamente al temario de matemáticas. Si el estudiante se desvía, reajústalo amablemente al tema.
- Tu tono es directo, alentador, socrático y enfocado en VENCER el examen.
- Escribe SIEMPRE en español.
- Mantén tus párrafos muy cortos. Usa texto en negrita para enfatizar ideas.
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
    res.json({ explanation });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to generate tutor explanation' });
  }
});

app.listen(PORT, () => {
  console.log(`SnapPrep Backend server running on port ${PORT}`);
});