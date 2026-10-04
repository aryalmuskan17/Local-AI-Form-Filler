import { GEMINI_MODEL } from '../utils/constants.js';

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const classificationSchema = {
  type: 'OBJECT',
  properties: {
    document_type: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    reason: { type: 'STRING' }
  },
  required: ['document_type', 'confidence', 'reason']
};

const classificationPrompt = `Classify this document using only visible evidence. Return exactly one document_type from: citizenship, passport, ielts_trf, academic, transcript, cv, employment, other. For IELTS TRF, look for indicators such as IELTS, International English Language Testing System, Test Report Form, Listening, Reading, Writing, Speaking, Overall Band Score, Candidate Number, or Test Date; do not require every indicator. Return confidence from 0 to 1. Do not silently choose passport when uncertain. Return JSON only.`;

async function fetchWithRetry(url, options) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, options);
    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_RETRIES) return response;
    await wait(2000 * (2 ** attempt));
  }
}

export async function testGeminiConnection(apiKey) {
  const response = await fetchWithRetry(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }] })
  });
  if (!response.ok) throw new Error(response.status === 429 ? 'Gemini quota exceeded.' : 'Gemini connection failed. Check your key.');
  return true;
}

export async function classifyDocument({ apiKey, document }) {
  if (!apiKey) throw new Error('Add your Gemini API key in Settings before extracting.');
  const response = await fetchWithRetry(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ inlineData: { mimeType: document.mimeType || 'application/pdf', data: document.base64 } }, { text: classificationPrompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: classificationSchema, temperature: 0 }
    })
  });
  if (!response.ok) throw new Error('Gemini could not classify this document.');
  const payload = await response.json();
  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Gemini returned no document classification.');
  try {
    return JSON.parse(rawText.replace(/```json\n?|```/g, '').trim());
  } catch {
    throw new Error('Gemini returned malformed classification data.');
  }
}

export async function extractDocument({ apiKey, document, prompt, schema }) {
  if (!apiKey) throw new Error('Add your Gemini API key in Settings before extracting.');
  try {
    const cleanBase64Data = document.base64;
    const cleanMimeType = document.mimeType || 'application/pdf';
    const response = await fetchWithRetry(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inlineData: { mimeType: cleanMimeType, data: cleanBase64Data } },
          { text: prompt || 'Extract all fields from this document into a valid JSON object.' }
        ] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0 }
      })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorBody);
      throw new Error(errorBody.error?.message || (response.status === 429 ? 'Gemini quota exceeded. Try again later.' : 'Gemini could not process this document.'));
    }
    const payload = await response.json();
    const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Gemini returned no structured data. Please retry.');
    const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
    try {
      const parsedData = JSON.parse(cleanJson);
      return parsedData;
    } catch {
      throw new Error('Gemini returned malformed data. Please retry.');
    }
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    throw error;
  }
}
