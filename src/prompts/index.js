import citizenship from './citizenshipPrompt.js';
import passport from './passportPrompt.js';
import ieltsTrf from './ieltsTrfPrompt.js';
import academic from './academicPrompt.js';
import transcript from './transcriptPrompt.js';
import cv from './cvPrompt.js';
import employment from './employmentPrompt.js';
import generic from './genericPrompt.js';

export const DOCUMENT_CONFIGS = { citizenship, passport, ielts_trf: ieltsTrf, academic, transcript, cv, employment, other: generic };
export function isSupportedDocumentType(type) {
  return Boolean(DOCUMENT_CONFIGS[type]);
}

export function getDocumentConfig(type) {
  return DOCUMENT_CONFIGS[type] || generic;
}

export function getPrompt(type) {
  return getDocumentConfig(type).prompt;
}

export function getSchema(type) {
  return getDocumentConfig(type).schema;
}

export function getFields(type) {
  return getDocumentConfig(type).fields;
}

const profileMappings = {
  citizenship: { category: 'Identity Documents', fields: { fullName: 'full_name', dateOfBirth: 'date_of_birth', nationality: 'nationality', citizenshipNumber: 'citizenship_number' } },
  passport: { category: 'Identity Documents', fields: { fullName: 'full_name', dateOfBirth: 'date_of_birth', nationality: 'nationality', passportNumber: 'passport_number', expiryDate: 'expiry_date' } },
  ielts_trf: { category: 'English Test Results', fields: { candidateName: 'candidate_name', candidateNumber: 'candidate_number', testDate: 'test_date', listening: 'listening', reading: 'reading', writing: 'writing', speaking: 'speaking', overall: 'overall', cefrLevel: 'cefr_level' } },
  academic: { category: 'Academic Profile', fields: { studentName: 'student_name', institution: 'institution', degree: 'degree', program: 'program', graduationYear: 'graduation_year' } },
  transcript: { category: 'Academic Profile', fields: { studentName: 'student_name', institution: 'institution', degree: 'degree', program: 'program', gpa: 'gpa', graduationYear: 'graduation_year' } },
  cv: { category: 'Professional Profile', fields: { fullName: 'full_name', email: 'email', phone: 'phone', address: 'address', education: 'education', experience: 'experience', skills: 'skills' } },
  employment: { category: 'Professional Profile', fields: { fullName: 'full_name', employer: 'employer', jobTitle: 'job_title', startDate: 'start_date', endDate: 'end_date' } },
  other: { category: 'Custom Profile', fields: {} }
};

export function getProfileMapping(type, data) {
  const mapping = profileMappings[type] || profileMappings.other;
  if (type === 'cv') {
    const education = data?.education?.[0] || {};
    const experience = data?.experience?.[0] || {};
    return { category: 'Professional Profile', data: { full_name: data?.full_name ?? null, email: data?.email ?? null, phone: data?.phone ?? null, address: data?.address ?? null, highest_degree: education.degree ?? null, university: education.institution ?? null, field_of_study: education.field_of_study ?? null, graduation_year: education.end_date ?? null, current_job_title: experience.job_title ?? null, current_company: experience.company ?? null, skills: data?.skills ?? [], certifications: data?.certifications ?? [], languages: data?.languages ?? [], projects: data?.projects ?? [] } };
  }
  return { category: mapping.category, data: Object.fromEntries(Object.entries(mapping.fields).map(([profileField, documentField]) => [profileField, data?.[documentField] ?? null])) };
}
