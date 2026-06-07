export function parseStepTexts(stepsText) {
  return String(stepsText || '')
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

export function buildStepPreviews(stepsText, stepImages = []) {
  return parseStepTexts(stepsText).map((text, index) => ({
    text,
    image: stepImages[index] || '',
  }));
}

export function syncStepImagesWithSteps(previousPreviews = [], nextStepsText = '') {
  const nextTexts = parseStepTexts(nextStepsText);
  const previousByText = new Map();
  previousPreviews.forEach((preview) => {
    const text = String((preview && preview.text) || '').trim();
    const image = preview && preview.image ? preview.image : '';
    if (!text || !image) return;
    if (!previousByText.has(text)) previousByText.set(text, []);
    previousByText.get(text).push(image);
  });

  const sameStepCount = previousPreviews.length === nextTexts.length;
  return nextTexts.map((text, index) => {
    const matchedImages = previousByText.get(text);
    if (matchedImages && matchedImages.length) return matchedImages.shift();
    return sameStepCount && previousPreviews[index] ? previousPreviews[index].image || '' : '';
  });
}
