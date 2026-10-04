export async function prepareDocument(file) {
  const fileDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read this file.'));
    reader.readAsDataURL(file);
  });
  const base64Data = fileDataUrl.replace(/^data:[^;]+;base64,/, '');
  const mimeType = file.type === 'image/jpeg' || file.type === 'image/jpg'
    ? 'image/jpeg'
    : file.type === 'image/png'
      ? 'image/png'
      : file.type === 'application/pdf'
        ? 'application/pdf'
        : file.type || 'application/pdf';
  return { base64: base64Data, mimeType, name: file.name, size: file.size };
}

export function releaseTemporaryDocument(document) {
  if (document) document.base64 = null;
}
