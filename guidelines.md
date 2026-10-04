# MASTER PROMPT: Build a Privacy-First AI Chrome Form Filler

## 1. ROLE

You are the lead software engineer responsible for building a production-quality Chrome Extension called:

**Local AI Form Filler**

The extension allows users to upload personal documents such as citizenship certificates, passports, academic certificates, transcripts and CVs, extract structured information using the user's own Gemini API key, store the resulting profiles locally, detect fields on websites and assist the user in filling those fields automatically.

You must follow every requirement in this specification.

Do not remove or simplify major features without explicitly explaining why.

Do not introduce a backend server.

Do not introduce a database server.

Do not introduce user accounts.

Do not introduce Firebase, Supabase, MongoDB, Express or any other application backend.

The extension must remain a **zero-custom-server Chrome extension**.

---

# 2. CORE PRODUCT PRINCIPLE

The most important principle is:

> **Gemini extracts information. The extension decides where that information goes.**

Gemini must NOT control the website form.

The extension is responsible for:

1. Reading the user's selected document.
2. Sending the document to Gemini for extraction.
3. Receiving structured JSON.
4. Showing the extracted information to the user.
5. Allowing the user to correct the information.
6. Saving the confirmed information locally.
7. Detecting website form fields.
8. Matching website fields with local profile fields.
9. Showing the proposed mappings to the user.
10. Filling the form only after user confirmation.

The extension must NEVER automatically submit a website form.

---

# 3. IMPORTANT PRIVACY REQUIREMENT

The architecture must use:

**Zero custom backend / zero application server.**

All application data must remain inside the user's Chrome extension storage.

However, do NOT describe the product as "100% on-device AI."

Document extraction uses Google's Gemini API.

When the user requests document extraction:

```text
User Document
     ↓
Extension
     ↓
Gemini API
     ↓
Structured JSON
     ↓
Extension
     ↓
Local Storage
```

The extension must not send document data to any custom server.

The only external service required for AI extraction is the Gemini API selected by the user.

---

# 4. GEMINI API / BYOK

The extension must use:

**BYOK — Bring Your Own Key**

The user supplies their own Gemini API key.

The extension must NOT contain a developer-owned API key.

Do not hardcode an API key anywhere in the source code.

Do not place an API key in GitHub.

Do not put an API key in `manifest.json`.

Do not create a backend proxy to hide the API key.

The user enters their Gemini API key through the extension Settings page.

Example:

```text
Gemini API Key

[ ****************************** ]

[ Show ]

[ Test Connection ]

[ Save ]
```

The key must be stored locally.

Provide:

```text
Save API Key
Test Connection
Show/Hide Key
Replace Key
Remove Key
```

---

# 5. GEMINI MODEL

Use the currently configured Gemini model through a centralized service.

The initial target is:

```text
gemini-3.8-flash
```

Use a single configuration location so the model can easily be changed later.

Do NOT hardcode the model name in multiple files.

Example concept:

```javascript
const GEMINI_MODEL = "gemini-3.8-flash";
```

The Gemini API URL should be constructed from this configuration.

---

# 6. STRUCTURED OUTPUT

Do not depend on free-form Gemini responses.

Gemini must return structured JSON.

Use JSON schema / structured output where supported.

The extension should validate the returned JSON before accepting it.

If Gemini returns malformed or incomplete data:

```text
Gemini Response
      ↓
Validation
      ↓
Invalid?
      ↓
Show error / retry
```

Do not blindly save malformed AI responses.

---

# 7. DOCUMENT TYPES

The extension must support these document categories:

```text
Citizenship / National ID
Passport
Academic Certificate
Academic Transcript
CV / Resume
Employment Document
Other
```

The architecture must make it easy to add additional document types later.

---

# 8. DOCUMENT UPLOAD

Support:

```text
JPEG
PNG
WEBP
PDF
```

The upload UI should support:

* Click to upload
* Drag and drop
* File validation
* File size validation
* File type validation
* Upload progress
* Processing status
* Extraction status
* Error state
* Preview where practical

Example:

```text
┌─────────────────────────────────────┐
│                                     │
│       Drop document here            │
│                                     │
│       or                            │
│                                     │
│       [ Choose File ]               │
│                                     │
│  JPG • PNG • WEBP • PDF             │
│                                     │
└─────────────────────────────────────┘
```

---

# 9. PDF PROCESSING

Use PDF.js bundled locally.

Required files:

```text
lib/
├── pdf.min.js
└── pdf.worker.min.js
```

Do not load PDF.js from a remote CDN.

For PDFs:

```text
PDF
 ↓
PDF.js
 ↓
Render required pages
 ↓
Convert to image/base64 where needed
 ↓
Gemini
```

The architecture must support multi-page PDFs.

Do not assume every useful document is one page.

---

# 10. DOCUMENT-SPECIFIC EXTRACTION

Do NOT use one generic extraction prompt for every document.

Create document-specific extraction configurations.

Example:

```text
src/prompts/
├── citizenshipPrompt.js
├── passportPrompt.js
├── academicPrompt.js
├── transcriptPrompt.js
├── cvPrompt.js
├── employmentPrompt.js
└── genericPrompt.js
```

Each document type should have:

* Prompt
* JSON schema
* Expected fields
* Validation rules
* Normalization rules

---

# 11. CITIZENSHIP EXTRACTION

For citizenship/national ID documents, attempt to extract fields such as:

```text
full_name
first_name
middle_name
last_name
date_of_birth
gender
nationality
citizenship_number
father_name
mother_name
spouse_name
permanent_address
province
district
municipality
ward
issue_date
issuing_authority
```

Only populate fields that actually exist in the document.

Never invent missing information.

If a value cannot be confidently extracted:

```text
null
```

or an equivalent empty value should be used.

---

# 12. PASSPORT EXTRACTION

Attempt to extract:

```text
full_name
first_name
middle_name
last_name
passport_number
nationality
date_of_birth
gender
place_of_birth
issue_date
expiry_date
issuing_authority
```

Again:

Never invent missing information.

---

# 13. ACADEMIC DOCUMENT EXTRACTION

Support:

```text
student_name
institution
university
board
degree
program
major
registration_number
symbol_number
gpa
percentage
division
graduation_year
```

Support multiple academic records.

For example:

```json
{
  "education": [
    {
      "degree": "Bachelor",
      "institution": "...",
      "program": "...",
      "gpa": "...",
      "graduation_year": "..."
    }
  ]
}
```

---

# 14. CV EXTRACTION

Support:

```text
full_name
email
phone
address
education
experience
skills
certifications
languages
projects
```

Education and experience must support arrays.

---

# 15. UNIFIED PROFILE MODEL

Do not store completely unrelated structures for every document.

Create a normalized profile model.

Example:

```json
{
  "personal": {
    "full_name": "",
    "first_name": "",
    "middle_name": "",
    "last_name": "",
    "date_of_birth": "",
    "gender": "",
    "nationality": ""
  },

  "contact": {
    "email": "",
    "phone": ""
  },

  "address": {
    "country": "",
    "province": "",
    "district": "",
    "municipality": "",
    "ward": "",
    "street": ""
  },

  "documents": {
    "citizenship_number": "",
    "passport_number": "",
    "issue_date": "",
    "expiry_date": "",
    "issuing_authority": ""
  },

  "education": [],

  "employment": [],

  "skills": [],

  "certifications": []
}
```

The exact schema can evolve during implementation, but the architecture must remain normalized and extensible.

---

# 16. AI EXTRACTION REVIEW

NEVER save Gemini extraction directly without user review.

Required workflow:

```text
Upload
 ↓
Gemini
 ↓
Extracted Data
 ↓
Review Screen
 ↓
User Edits
 ↓
User Confirms
 ↓
Save Locally
```

The review interface should display:

```text
Field                Extracted Value

Full Name             Muskan Aryal       [Edit]
Date of Birth         2002-XX-XX         [Edit]
Passport Number       XXXXXXXX           [Edit]
Address               Pokhara            [Edit]
```

Allow:

```text
Edit
Add Field
Delete Field
Reset Field
Confirm
Cancel
```

---

# 17. LOCAL STORAGE

Use:

```javascript
chrome.storage.local
```

Application data must not be sent to a custom server.

Organize storage logically:

```text
settings
documents
profiles
mappings
applicationSessions
```

Example:

```text
chrome.storage.local

├── settings
│   ├── geminiApiKey
│   ├── theme
│   └── language
│
├── documents
│
├── profiles
│
├── mappings
│
└── applicationSessions
```

Do not store everything in one huge object.

---

# 18. LOCAL SECURITY

Because the extension handles sensitive personal documents, implement a security layer.

Use the Web Crypto API where appropriate.

Consider:

```text
AES-GCM
```

for sensitive locally stored data.

The architecture should make encryption/decryption a separate service:

```text
src/services/encryptionService.js
```

Do not implement encryption manually.

Do not invent cryptographic algorithms.

---

# 19. TEMPORARY DATA CLEANUP

Temporary document/base64 data should not remain unnecessarily after processing.

After extraction:

```text
Temporary data
      ↓
No longer needed
      ↓
Clear/release
```

The user should also have:

```text
Clear temporary data
Delete document
Delete profile
Delete all extension data
```

---

# 20. SIDE PANEL

Use Chrome's Side Panel API.

The side panel is the primary UI.

Recommended sections:

```text
Home
Documents
Profiles
Current Form
Settings
Privacy
```

---

# 21. DASHBOARD

The Home page should show:

```text
Local AI Form Filler

Documents
[ 5 ]

Profiles
[ 3 ]

Current Website
12 fields detected

[ Scan Form ]

[ Auto-Fill ]
```

Keep the UI simple and professional.

---

# 22. DOCUMENT MANAGER

The Documents page should allow:

```text
Upload
View
Edit
Extract
Re-extract
Delete
Categorize
```

Example card:

```text
┌───────────────────────────────┐
│ 🇳🇵 Citizenship               │
│                               │
│ Muskan Aryal                  │
│ Added: Sep 26, 2026           │
│                               │
│ [View] [Edit] [Delete]        │
└───────────────────────────────┘
```

---

# 23. PROFILE MANAGER

Users should be able to create profiles such as:

```text
Personal Profile
Academic Profile
Professional Profile
International Application
Custom Profile
```

A profile can combine information from multiple documents.

Example:

```text
Passport
+
Citizenship
+
Bachelor Transcript
+
CV
=
International Application Profile
```

---

# 24. FORM DETECTION

The content script must scan:

```text
input
textarea
select
```

and eventually:

```text
radio
checkbox
date
dynamic fields
```

Do not rely only on:

```text
input.name
```

Inspect:

```text
name
id
placeholder
aria-label
associated <label>
autocomplete
type
nearby text
```

---

# 25. FORM FIELD MATCHING

Create a dedicated:

```text
fieldMatcher.js
```

Do not place all matching logic inside `content.js`.

The matcher should assign confidence scores.

Example:

```text
Website field:
Date of Birth

Possible profile matches:

date_of_birth    98%
birth_date       96%
issue_date       12%
```

Use the highest appropriate score.

But ambiguous fields should be shown to the user.

---

# 26. FIELD PATTERNS

Create a centralized field pattern configuration.

Example:

```text
Name:
full_name
first_name
last_name
fname
lname
candidate_name

DOB:
dob
birth
date_of_birth
birth_date
bday

Passport:
passport
passport_number
passport_no

Citizenship:
citizenship
citizenship_number
citizenship_no
nid
national_id

Address:
address
location
residence
street
city

Academic:
gpa
cgpa
marks
percentage
grade

Contact:
phone
mobile
tel
email
e-mail
```

Do not scatter these patterns across many files.

---

# 27. LABEL DETECTION

Implement a helper such as:

```javascript
getAssociatedLabelText(element)
```

It should attempt to find:

```text
<label for="...">
```

and nearby/associated labels where practical.

Combine label text with other field attributes.

---

# 28. REACT / VUE / ANGULAR SUPPORT

Simple:

```javascript
element.value = value;
```

is not sufficient for every modern web application.

Implement framework-compatible value setting and dispatch appropriate events:

```text
input
change
blur
```

For standard HTML inputs, use the native setter when appropriate.

Test against:

```text
Plain HTML
React
Vue
Angular
```

---

# 29. SELECT FIELDS

Support:

```html
<select>
```

Map values intelligently.

Example:

```text
Profile:
Gender = Male

Website:
M
Male
Man
```

The matcher should select the appropriate option where confidence is high.

If ambiguous:

```text
Ask user
```

---

# 30. RADIO BUTTONS

Support radio groups.

Example:

```text
Gender

○ Male
○ Female
○ Other
```

Use profile information to select the matching option.

Never select ambiguous values automatically.

---

# 31. CHECKBOXES

Support checkbox fields where the profile contains a matching boolean or known value.

Do not blindly tick legal declarations or consent boxes.

For example:

```text
☐ I agree to the terms
```

must NOT be automatically checked.

The user must handle consent/legal confirmation manually.

---

# 32. DATE FIELDS

Support:

```text
input[type=date]
```

and textual date fields.

Normalize dates internally.

Example:

```text
YYYY-MM-DD
```

When the website requires another format, convert appropriately.

---

# 33. AD / BS SUPPORT

Add an optional date conversion service.

Support:

```text
AD → BS
BS → AD
```

This is particularly useful for Nepali users.

Never silently convert a date.

Show:

```text
Source:
2061-04-15 BS

Website requires:
2024-07-31 AD

[Use Converted Value]
```

---

# 34. NAME PARSING

Support:

```text
full_name
first_name
middle_name
last_name
```

Example:

```text
Full Name:
Muskan Aryal
```

can become:

```text
First Name: Muskan
Middle Name:
Last Name: Aryal
```

But parsing must remain editable because names do not always follow the same structure.

---

# 35. MULTI-PAGE FORMS

Support application sessions.

Example:

```text
Application Session

Website:
example.com

Profile:
International Application

✓ Personal Information
✓ Address
○ Education
○ Passport
○ Review
```

The extension should preserve the selected profile while the user navigates through the application.

Do not automatically submit or navigate through legally significant pages without user action.

---

# 36. CUSTOM WEBSITE MAPPINGS

Implement:

```text
mappings/
```

A mapping can connect:

```text
Profile Field
      ↓
Website Field
```

Example:

```text
first_name
      ↓
applicantFirstName

last_name
      ↓
applicantLastName

date_of_birth
      ↓
birthDate

passport_number
      ↓
passportNumber
```

Save mappings locally.

Allow users to:

```text
Create
Edit
Delete
Disable
```

a mapping.

---

# 37. WEBSITE IDENTIFICATION

Use URL/domain information only to identify the website for locally stored mappings.

Do not send browsing history to any server.

Example local record:

```json
{
  "domain": "example.com",
  "pathPattern": "/application/*",
  "mapping": {}
}
```

---

# 38. AUTOFILL UX

The extension should show detected fields before filling.

Example:

```text
CURRENT FORM

14 fields detected

✓ Full Name
✓ Date of Birth
✓ Email
✓ Phone
✓ Address
✓ Passport Number

⚠ University
⚠ Program

[Review Matches]

[⚡ Auto-Fill Selected Fields]
```

The user must remain in control.

---

# 39. SENSITIVE FIELD CONFIRMATION

For sensitive fields such as:

```text
Passport number
Citizenship number
National ID
Date of birth
Personal address
Bank/account information
```

consider showing an additional confirmation.

Example:

```text
You are about to fill sensitive identity information.

[Cancel] [Continue]
```

---

# 40. NEVER AUTOMATICALLY SUBMIT FORMS

This is mandatory.

The extension may:

```text
Detect
Match
Fill
Highlight
```

but must not:

```text
Automatically submit
Automatically agree to terms
Automatically accept declarations
Automatically complete legal consent
```

---

# 41. BACKGROUND SERVICE WORKER

Use:

```text
background.js
```

for:

* Message routing
* Side panel behavior
* Optional context menu
* Extension lifecycle
* Other background-only Chrome APIs

Do not put unnecessary application logic here.

---

# 42. CONTEXT MENU

Optionally provide:

```text
Right click
      ↓
"Open Local AI Form Filler"
```

or:

```text
"Scan Current Form"
```

Do not create a context-menu action that silently fills sensitive information.

---

# 43. IMPORT / EXPORT

Provide:

```text
Export Data
Import Data
```

Export should preferably produce an encrypted backup.

Example:

```text
local-ai-form-filler-backup.json
```

or an encrypted equivalent.

Never upload the backup.

---

# 44. PRIVACY DASHBOARD

Create a dedicated Privacy page.

Display:

```text
PRIVACY STATUS

✓ No account required
✓ No custom backend
✓ No analytics
✓ No tracking
✓ Profiles stored locally
✓ Settings stored locally
✓ User controls Gemini API key
✓ No application database
```

Also clearly explain:

```text
DOCUMENT AI PROCESSING

When you request document extraction,
the selected document is sent to Google's
Gemini API using your API key.

The extension does not send your data
to a custom application server.
```

---

# 45. SETTINGS

Settings should include:

```text
AI
 ├── Gemini API Key
 ├── Test Connection
 └── Remove Key

Appearance
 ├── Light
 ├── Dark
 └── System

Language
 ├── English
 └── Nepali

Privacy
 ├── Sensitive field confirmation
 ├── Clear temporary data
 └── Delete all data

Data
 ├── Export
 └── Import
```

---

# 46. INTERNATIONALIZATION

The architecture must support:

```text
English
Nepali
```

from the beginning.

Do not hardcode UI text throughout components.

Use an i18n structure so additional languages can be added later.

Example:

```text
src/locales/
├── en.json
└── ne.json
```

---

# 47. THEME

Support:

```text
Light
Dark
System
```

Store the preference locally.

---

# 48. ERROR HANDLING

Every major operation must have proper error handling.

Handle:

```text
Missing API key
Invalid API key
Gemini API failure
Gemini quota exceeded
Network failure
Unsupported file
Oversized file
Invalid PDF
Malformed JSON
Missing fields
No form detected
Content script unavailable
Restricted Chrome page
Permission denied
Storage failure
```

Errors must be understandable to normal users.

Do not expose raw stack traces in the UI.

---

# 49. RESTRICTED PAGES

The extension should gracefully handle pages where content scripts cannot operate, such as Chrome internal pages or other restricted contexts.

Show a clear message such as:

```text
This page does not allow extensions to modify its content.
```

Do not crash.

---

# 50. CONTENT SCRIPT SAFETY

The content script must:

* Avoid modifying unrelated page content.
* Avoid injecting arbitrary HTML.
* Avoid executing website-provided JavaScript.
* Avoid evaluating strings as JavaScript.
* Only modify form fields explicitly selected for autofill.
* Respect disabled/read-only fields.
* Avoid filling hidden fields unless explicitly supported and safe.

---

# 51. SECURITY RULES

Never:

```text
eval()
new Function()
remote JavaScript
remote scripts
hardcoded secrets
developer API key
```

Do not use unnecessary permissions.

Request the minimum permissions required.

---

# 52. MANIFEST V3

Use Manifest V3.

The manifest should contain only the permissions actually required.

Expected capabilities include:

```text
storage
activeTab
scripting
sidePanel
```

Use host permissions only where necessary.

Gemini API access must be configured appropriately.

Do not request broad permissions without justification.

---

# 53. INITIAL DIRECTORY STRUCTURE

The final implementation may use the following structure:

```text
auto-form-filler/
│
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── lib/
│       ├── pdf.min.js
│       └── pdf.worker.min.js
│
├── src/
│   ├── background/
│   │   └── background.js
│   │
│   ├── content/
│   │   ├── content.js
│   │   ├── fieldDetector.js
│   │   ├── fieldMatcher.js
│   │   └── fieldFiller.js
│   │
│   ├── sidepanel/
│   │   ├── SidePanel.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   ├── ProfileEditor.jsx
│   │   │   ├── ApiKeySettings.jsx
│   │   │   ├── FieldReview.jsx
│   │   │   ├── FormScanner.jsx
│   │   │   └── FillPreview.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Documents.jsx
│   │       ├── Profiles.jsx
│   │       ├── CurrentForm.jsx
│   │       ├── Settings.jsx
│   │       └── Privacy.jsx
│   │
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── storageService.js
│   │   ├── pdfService.js
│   │   ├── encryptionService.js
│   │   └── dateService.js
│   │
│   ├── prompts/
│   │   ├── citizenshipPrompt.js
│   │   ├── passportPrompt.js
│   │   ├── academicPrompt.js
│   │   ├── transcriptPrompt.js
│   │   ├── cvPrompt.js
│   │   ├── employmentPrompt.js
│   │   └── genericPrompt.js
│   │
│   ├── utils/
│   │   ├── fieldPatterns.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   ├── locales/
│   │   ├── en.json
│   │   └── ne.json
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

You may improve the structure if there is a strong technical reason, but explain the change first.

---

# 54. DEVELOPMENT PHASES

Do NOT build everything in one step.

Build the project in phases.

## Phase 1 — Foundation

Implement:

```text
React
Vite
Manifest V3
Side Panel
Background Service Worker
Content Script
Chrome Storage
Basic UI
```

Verify that the extension loads successfully.

---

## Phase 2 — Settings

Implement:

```text
Gemini API key
Save
Remove
Show/hide
Test connection
```

Verify Gemini connection.

---

## Phase 3 — Document Upload

Implement:

```text
Image upload
PDF upload
PDF.js
Preview
Document categories
```

---

## Phase 4 — Gemini Extraction

Implement:

```text
Gemini service
Document-specific prompts
Structured JSON
Schema validation
Error handling
```

---

## Phase 5 — Profile Review

Implement:

```text
Extracted data
Editable fields
Add field
Delete field
Confirm
Save locally
```

---

## Phase 6 — Basic Autofill

Support:

```text
input
textarea
select
```

with basic matching.

---

## Phase 7 — Intelligent Matching

Implement:

```text
Field detector
Field matcher
Confidence scores
Labels
ARIA labels
Placeholders
Autocomplete
```

---

## Phase 8 — Framework Support

Test:

```text
HTML
React
Vue
Angular
```

---

## Phase 9 — Advanced Fields

Implement:

```text
Radio
Checkbox
Date
Dynamic fields
```

Remember:

Never automatically tick legal/consent checkboxes.

---

## Phase 10 — Profiles

Implement:

```text
Personal
Academic
Professional
International Application
Custom
```

---

## Phase 11 — Custom Website Mappings

Implement:

```text
Website identification
Mapping editor
Local mapping storage
Mapping reuse
```

---

## Phase 12 — Multi-Page Forms

Implement:

```text
Application sessions
Session persistence
Page progress
Profile persistence
```

---

## Phase 13 — Security and Privacy

Implement:

```text
Local encryption
Temporary data cleanup
Sensitive field confirmation
Delete all data
Export
Import
Privacy dashboard
```

---

## Phase 14 — Localization

Implement:

```text
English
Nepali
```

---

## Phase 15 — Testing

Test against:

```text
Plain HTML
React
Vue
Angular
University forms
Job application forms
Government-style forms
Multi-page forms
Different field names
Different date formats
Invalid documents
Missing values
Gemini errors
Multiple tabs
Browser restart
Storage persistence
```

---

## Phase 16 — Chrome Web Store

Prepare:

```text
Production build
Icons
Screenshots
Description
Privacy disclosures
Permission justification
Store listing
ZIP/package
```

Check the current Chrome Web Store policies and requirements before submission.

---

# 55. TESTING RULES

The extension must not be considered complete merely because it builds.

Every feature must be tested.

For each major feature, verify:

```text
Happy path
Invalid input
Missing input
Network failure
API failure
Permission failure
Browser restart
Multiple tabs
```

---

# 56. V1 PRIORITY

Do not over-engineer the first release.

The first working version must reliably accomplish:

```text
Upload document
      ↓
Extract using Gemini
      ↓
Review extracted information
      ↓
Save profile locally
      ↓
Open website
      ↓
Detect form
      ↓
Match fields
      ↓
Review matches
      ↓
Click Auto-Fill
      ↓
Fields are filled
```

Do not move to advanced features until this workflow works reliably.

---

# 57. FREE PRODUCT REQUIREMENT

All planned features are free.

There will be:

```text
No Pro tier
No premium tier
No subscription
No paid feature lock
No account requirement
```

The user supplies their own Gemini API key.

Do not implement payment infrastructure.

---

# 58. NO SERVER REQUIREMENT

Do not create:

```text
server/
backend/
api/
database/
auth server/
proxy server/
```

unless explicitly requested later.

The application must work without any custom server.

---

# 59. CODE QUALITY

Follow these rules:

* Use modular JavaScript.
* Keep services separate from UI.
* Keep content-script logic separate from React UI.
* Keep Gemini API logic separate from storage.
* Keep field matching separate from field filling.
* Avoid giant files.
* Avoid duplicated logic.
* Use reusable functions.
* Use clear names.
* Handle errors properly.
* Do not leave unnecessary console logs in production.
* Do not hardcode secrets.
* Do not use unnecessary dependencies.

---

# 60. IMPORTANT CODING-AGENT BEHAVIOR

Before changing an existing file:

1. Inspect the existing file.
2. Understand its current implementation.
3. Preserve working functionality.
4. Make the smallest appropriate change.
5. Do not rewrite unrelated files.
6. Explain important architectural changes.
7. After changes, check for syntax/import/build errors.

Do not create duplicate implementations of the same service.

For example, there must be one primary Gemini service rather than multiple competing Gemini API implementations.

---

# 61. DEPENDENCY RULE

Before installing a library:

1. Determine whether the functionality can be implemented using browser/Chrome APIs.
2. If a library is genuinely useful, use a well-maintained package.
3. Avoid unnecessary dependencies.
4. Do not load remote JavaScript at runtime.

PDF.js should be bundled locally.

---

# 62. CHROME EXTENSION RESTRICTIONS

Remember that Chrome extensions have restrictions around:

* Content Security Policy
* Remote code
* File inputs
* Chrome internal pages
* Cross-origin requests
* Service workers
* Content script isolation

The implementation must respect Manifest V3 requirements.

---

# 63. USER EXPERIENCE

The extension should feel like a modern productivity application.

Prioritize:

```text
Simple
Fast
Clear
Professional
Privacy-focused
```

Avoid overwhelming users with technical information.

Technical details should be available under:

```text
Privacy → Technical Details
```

---

# 64. FINAL PRODUCT UI

The main navigation should approximately be:

```text
┌───────────────────────────────┐
│       Local AI Form Filler    │
├───────────────────────────────┤
│                               │
│  🏠 Home                      │
│  📄 Documents                 │
│  👤 Profiles                  │
│  ⚡ Current Form              │
│  ⚙ Settings                  │
│  🔒 Privacy                  │
│                               │
├───────────────────────────────┤
│                               │
│  Current Website              │
│  12 fields detected           │
│                               │
│  [ Scan Form ]                │
│  [ ⚡ Auto-Fill ]             │
│                               │
└───────────────────────────────┘
```

---

# 65. DEFINITION OF DONE

The project is considered complete only when:

* The extension loads in Chrome.
* Side panel works.
* Gemini API key can be configured.
* Gemini connection can be tested.
* Images can be uploaded.
* PDFs can be uploaded.
* PDF.js works locally.
* Documents can be categorized.
* Gemini extracts structured data.
* Extracted data can be reviewed.
* Extracted data can be edited.
* Profiles are stored locally.
* Profiles can be deleted.
* Forms can be detected.
* Fields can be matched.
* Matching confidence can be displayed.
* HTML forms can be filled.
* React forms can be filled.
* Vue/Angular compatibility is tested.
* User confirmation is required before autofill.
* Forms are never automatically submitted.
* Consent/legal checkboxes are never automatically accepted.
* Custom website mappings work.
* Multiple profiles work.
* Multi-page sessions work.
* Import/export works.
* Privacy controls work.
* Temporary data can be cleared.
* No custom backend exists.
* No developer API key exists in the code.
* No unnecessary external requests exist.
* Production build succeeds.
* Extension can be packaged for Chrome Web Store submission.

---

# 66. HOW YOU SHOULD WORK WITH ME

Do not attempt to generate the entire application blindly in one response.

Work incrementally.

When I ask you to start:

1. Inspect the project.
2. Build Phase 1 only.
3. Show me the files created/changed.
4. Explain how to run and test Phase 1.
5. Wait for my confirmation.

Then proceed to the next phase.

When I report an error:

1. Identify the exact cause.
2. Tell me which file is responsible.
3. Provide the corrected file or exact change.
4. Do not rewrite unrelated parts.
5. Explain how to verify the fix.

Always prioritize a working, testable extension over generating a large amount of code at once.

---

# FINAL REQUIREMENT

Build this as a **privacy-first, zero-custom-server Chrome extension using the user's own Gemini API key**.

The final architecture should be:

```text
                    ┌─────────────────────┐
                    │   Chrome Extension  │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
        Side Panel        Content Script    Background
             │                 │                 │
      Document Manager     Form Scanner      Messaging
      Profile Manager      Field Matcher     Context Menu
      Settings             Form Filler
             │                 │
             ▼                 │
        Gemini API              │
      User's API Key            │
             │                 │
             ▼                 │
      Structured JSON           │
             │                 │
             └────────┬─────────┘
                      ▼
             chrome.storage.local
                      │
                      ▼
                  User Device
```

The central product principle remains:

> **Gemini extracts the information. The extension intelligently maps it. The user remains in control.**