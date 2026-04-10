import DOMPurify from 'dompurify';

export function sanitize(dirty) {
  if (typeof dirty === 'string') {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  if (typeof dirty === 'object' && dirty !== null) {
    const clean = Array.isArray(dirty) ? [] : {};
    for (const key in dirty) {
      if (Object.prototype.hasOwnProperty.call(dirty, key)) {
        clean[key] = sanitize(dirty[key]);
      }
    }
    return clean;
  }
  return dirty;
}

export function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty);
}
