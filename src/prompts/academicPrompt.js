const fields = ['student_name', 'institution', 'university', 'board', 'degree', 'program', 'major', 'registration_number', 'symbol_number', 'gpa', 'percentage', 'division', 'graduation_year'];
const schema = { type: 'OBJECT', properties: Object.fromEntries(fields.map((field) => [field, { type: 'STRING', nullable: true }])), required: fields };

export default { label: 'Academic Certificate', category: 'Academic Profile', fields, schema, prompt: `Extract only information visibly present in this academic certificate. Do not infer or guess. Return null for missing values and JSON only.` };