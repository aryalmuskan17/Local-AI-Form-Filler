import { MAX_FILE_SIZE } from './constants.js';
import { getDocumentConfig } from '../prompts/index.js';

export function validateFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Use a JPG, PNG, WEBP, or PDF document.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Files must be smaller than 15 MB.');
}

export function validateProfile(profile) {
  return profile && typeof profile === 'object' && Object.values(profile).some((value) => value !== null && value !== '');
}

export function normalizeExtractedData(type, data) {
  const config = getDocumentConfig(type);
  if (type === 'other') return data;
  const normalized = Object.fromEntries(config.fields.map((field) => [field, data?.[field] ?? null]));
  if (type === 'ielts_trf') {
    for (const field of ['listening', 'reading', 'writing', 'speaking', 'overall']) {
      const value = normalized[field];
      const numericValue = value === null || value === '' ? null : Number(value);
      normalized[field] = Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 9 ? String(value) : value;
    }
  }
  return normalized;
}
