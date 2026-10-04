const fields = ['student_name', 'institution', 'degree', 'program', 'gpa', 'graduation_year'];
const schema = { type: 'OBJECT', properties: Object.fromEntries(fields.map((field) => [field, { type: 'STRING', nullable: true }])), required: fields };

export default { label: 'Academic Transcript', category: 'Academic Profile', fields, schema, prompt: `Extract only information visibly present in this academic transcript. Do not infer or guess. Return null for missing values and JSON only.` };