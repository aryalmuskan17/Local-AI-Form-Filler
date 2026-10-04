const FIELD_PATTERNS = {
  full_name: ['full name', 'name', 'applicant name', 'candidate name'],
  first_name: ['first name', 'given name', 'fname'],
  middle_name: ['middle name', 'mname'],
  last_name: ['last name', 'surname', 'family name', 'lname'],
  date_of_birth: ['date of birth', 'birth date', 'dob', 'birthday'],
  email: ['email', 'e-mail'],
  phone: ['phone', 'mobile', 'telephone', 'tel'],
  passport_number: ['passport', 'passport number', 'passport no'],
  citizenship_number: ['citizenship', 'national id', 'national identification', 'nid'],
  address: ['address', 'residence', 'street', 'location'],
  nationality: ['nationality', 'citizen'],
  gender: ['gender', 'sex'],
  institution: ['institution', 'university', 'college', 'school'],
  degree: ['degree', 'program', 'major'],
  gpa: ['gpa', 'cgpa', 'percentage', 'marks']
};

function getAssociatedLabelText(element) {
  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label) return label.textContent.trim();
  }
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent.trim();
  return element.parentElement?.textContent?.trim().slice(0, 120) || '';
}

function detectFields() {
  return [...document.querySelectorAll('input, textarea, select')]
    .filter((element) => !element.disabled && !element.readOnly && element.type !== 'hidden')
    .map((element, index) => ({
      index,
      tagName: element.tagName.toLowerCase(),
      type: element.type || 'text',
      name: element.name || '',
      id: element.id || '',
      placeholder: element.placeholder || '',
      ariaLabel: element.getAttribute('aria-label') || '',
      autocomplete: element.autocomplete || '',
      label: getAssociatedLabelText(element),
      value: element.value || ''
    }));
}

function setNativeValue(element, value) {
  const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function fillField(field, value) {
  const elements = [...document.querySelectorAll('input, textarea, select')];
  const element = elements[field.index];
  if (!element || element.disabled || element.readOnly) return false;
  if (element.tagName === 'SELECT') {
    const option = [...element.options].find((candidate) => candidate.value.toLowerCase() === String(value).toLowerCase() || candidate.textContent.trim().toLowerCase() === String(value).toLowerCase());
    if (!option) return false;
    element.value = option.value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  setNativeValue(element, value);
  return true;
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'scan-form') sendResponse({ fields: detectFields(), url: location.href, domain: location.hostname });
  if (message.type === 'fill-fields') sendResponse({ filled: message.fields.filter(({ field, value }) => fillField(field, value)).length });
  return true;
});
