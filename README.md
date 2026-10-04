# Local AI Form Filler

> A privacy-conscious Chrome side-panel extension for extracting document data, reviewing it carefully, and filling web forms under explicit user control.

Local AI Form Filler uses your own Gemini API key to turn documents into editable, document-specific data. It stores reviewed results in Chrome local storage and never submits forms on your behalf.

## Highlights

- Review-first extraction with editable results before local saving
- Document-aware schemas for passports, citizenship documents, IELTS TRFs, academic records, CVs, employment documents, and generic documents
- Structured CV extraction for education, experience, skills, certifications, languages, and projects
- Automatic document classification with a manual-selection fallback
- Current-page form scanning and selective, user-confirmed autofill
- No custom backend, database, account system, analytics, or developer-owned AI key
- Local PDF.js assets for browser-side document packaging

## Privacy Model

The extension is designed around a simple boundary:

1. The user selects a document and requests extraction.
2. The selected document is sent directly to Google's Gemini API using the user's key.
3. Gemini returns structured data for the extension to display.
4. The user reviews and edits the result.
5. Only confirmed data is stored in `chrome.storage.local`.

The extension does not operate a custom server, silently upload documents, submit websites, or accept consent declarations.

## Supported Documents

| Document type | Extraction focus | Profile category |
| --- | --- | --- |
| Citizenship / National ID | Identity and citizenship fields | Identity Documents |
| Passport | Passport identity fields | Identity Documents |
| IELTS TRF | Candidate data and band scores | English Test Results |
| Academic Certificate | Award, institution, program, and result details | Academic Profile |
| Academic Transcript | Academic history and results | Academic Profile |
| CV / Resume | Structured professional history and reusable profile data | Professional Profile |
| Employment Document | Employer, role, dates, and responsibilities | Professional Profile |
| Other | Visible named fields with confidence values | Custom Profile |

Auto Detect classifies the uploaded document before extraction. Low-confidence classifications are not silently treated as passports; the user is asked to choose a type manually.

## CV Data Model

CV extraction keeps the existing top-level fields while preserving repeated records as structured objects:

- `education`: degree, field of study, institution, dates, grade, GPA, and description
- `experience`: job title, company, location, employment type, dates, current status, and description
- `skills`: name and optional category
- `certifications`: name, issuer, date, and credential ID
- `languages`: name and explicitly stated proficiency
- `projects`: name, description, technologies, role, and URL

The original structured document data is preserved separately from normalized reusable profile mappings.

## Requirements

- Node.js 18 or newer
- Google Chrome 116 or newer
- A Gemini API key for document extraction

## Installation

```sh
npm install
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the generated `dist` directory.
5. Open the extension side panel and add your Gemini API key in Settings.

## Development

Start the Vite development server:

```sh
npm run dev
```

Create a production bundle:

```sh
npm run build
```

Preview the production bundle locally:

```sh
npm run preview
```

## Usage

1. Open **Documents** and upload a JPG, PNG, WEBP, or PDF.
2. Choose a document type or leave **Auto Detect** selected.
3. Request extraction with your Gemini key.
4. Review, edit, add, remove, or reorder extracted values.
5. Confirm the document to save it locally.
6. Open a website and scan its form.
7. Select the fields you want to fill and review each proposed value.
8. Use **Auto-fill selected** when the values are correct.

## Project Structure

```text
src/
├── App.jsx                     # Side-panel UI and review workflows
├── prompts/                    # Document schemas and extraction prompts
│   ├── citizenshipPrompt.js
│   ├── passportPrompt.js
│   ├── ieltsTrfPrompt.js
│   ├── academicPrompt.js
│   ├── transcriptPrompt.js
│   ├── cvPrompt.js
│   ├── employmentPrompt.js
│   └── genericPrompt.js
├── services/
│   ├── geminiService.js        # Classification and extraction transport
│   ├── pdfService.js            # Temporary file preparation
│   └── storageService.js       # Chrome local storage access
└── utils/
	├── constants.js
	└── validators.js

public/
├── background.js                # Extension background worker
├── content.js                   # Form scanning and controlled filling
├── manifest.json                # Manifest V3 configuration
└── lib/                         # Bundled PDF.js assets
```

## Security and Data Handling

- API keys are stored in Chrome local storage and used directly for Gemini requests.
- Uploaded files are prepared temporarily for extraction and released after processing.
- Extracted data is not saved until the user confirms it.
- Form filling is selective and does not submit the surrounding website form.
- Identity-sensitive fields are document-specific and are not fabricated when absent.

## Current Scope

The current V1 focuses on the review-first side-panel workflow, document-specific extraction, local storage, and controlled form filling. Encrypted export/import, richer profile composition, localization expansion, automated browser fixtures, and Chrome Web Store packaging are future improvements.

## License

No license has been selected for this repository yet. Add a license file before distributing the project publicly.
