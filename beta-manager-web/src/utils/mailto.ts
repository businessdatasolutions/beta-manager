/**
 * Convert HTML to plain text for mailto body
 * Handles common HTML elements and preserves readability
 */
export function htmlToPlainText(html: string): string {
  let text = html;

  // Replace <br> and <br/> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Replace </p>, </div>, </li> with double newlines
  text = text.replace(/<\/(p|div)>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');

  // Replace <li> with bullet point
  text = text.replace(/<li[^>]*>/gi, '• ');

  // Replace </tr> with newline
  text = text.replace(/<\/tr>/gi, '\n');

  // Replace <td> with tab (for table formatting)
  text = text.replace(/<td[^>]*>/gi, '  ');

  // Extract href from links and show as: text (url)
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '$2 ($1)');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  text = text.replace(/[ \t]+/g, ' '); // Collapse spaces
  text = text.replace(/\n /g, '\n'); // Remove leading spaces after newlines

  return text.trim();
}

/**
 * Build a mailto URL with pre-filled subject and body
 * Note: URLs have ~2000 char limit in most browsers
 */
export function buildMailtoUrl(
  to: string,
  subject: string,
  body: string
): string {
  // Convert HTML body to plain text
  const plainBody = htmlToPlainText(body);

  // Use encodeURIComponent for proper mailto encoding
  // URLSearchParams uses + for spaces, but mailto needs %20
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(plainBody);

  const url = `mailto:${encodeURIComponent(to)}?subject=${encodedSubject}&body=${encodedBody}`;

  // Warn if URL is too long (2000 chars is safe limit)
  if (url.length > 2000) {
    console.warn(`Mailto URL is ${url.length} chars, may be truncated in some email clients`);
  }

  return url;
}

/**
 * Replace template variables in a string
 * Variables are in the format {{variable_name}}
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value ?? '');
  });

  return result;
}

/**
 * Calculate days in test from start date
 */
export function calculateDaysInTest(startedAt: string | null | undefined): number {
  if (!startedAt) return 0;

  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days remaining in 14-day test
 */
export function calculateDaysRemaining(startedAt: string | null | undefined): number {
  const daysIn = calculateDaysInTest(startedAt);
  return Math.max(0, 14 - daysIn);
}
