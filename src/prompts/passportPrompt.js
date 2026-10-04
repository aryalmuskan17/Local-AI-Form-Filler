const fields = ['full_name', 'first_name', 'middle_name', 'last_name', 'passport_number', 'nationality', 'date_of_birth', 'gender', 'place_of_birth', 'issue_date', 'expiry_date', 'issuing_authority'];
const arrayFields = new Set();
const schema = { type: 'OBJECT', properties: Object.fromEntries(fields.map((field) => [field, { type: 'STRING', nullable: true }])), required: fields };

export default { label: 'Passport', category: 'Identity Documents', fields, arrayFields, schema, prompt: `Extract only information visibly present in this passport. Do not infer or guess. Return null for missing values, normalize dates only when unambiguous, and return JSON only.` };