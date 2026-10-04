const fields = ['document_type', 'candidate_name', 'candidate_number', 'date_of_birth', 'test_date', 'test_type', 'test_centre', 'test_centre_number', 'trf_number', 'listening', 'reading', 'writing', 'speaking', 'overall', 'cefr_level'];
const schema = { type: 'OBJECT', properties: Object.fromEntries(fields.map((field) => [field, { type: 'STRING', nullable: true }])), required: fields };

export default {
  label: 'IELTS Test Report Form',
  category: 'English Test Results',
  fields,
  schema,
  prompt: `Extract only information that is visibly present in this IELTS Test Report Form. Do not infer information from general knowledge. Do not convert a candidate number into a passport number. Do not treat a TRF number as a passport number. Do not treat an IELTS test date as an issue date. Do not treat an IELTS result validity date as a passport expiry date. Do not infer nationality, gender, place of birth, issuing authority, or passport information unless explicitly present. If a field is not visible, return null. Return JSON only. Extract candidate_name, candidate_number, date_of_birth, test_date, test_type, test_centre, test_centre_number, trf_number, listening, reading, writing, speaking, overall, and cefr_level only when visibly present.`
};