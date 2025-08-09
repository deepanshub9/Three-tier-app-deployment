// Simple input sanitization utilities

export const sanitizeHtml = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeForLog = (input) => {
  if (!input) return '';
  
  // Encode for safe logging
  return encodeURIComponent(String(input));
};

export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};