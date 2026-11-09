// Ordinary URL construction still polyfills; only the bundler's source pattern stays native.
const file = JSON.parse('"./logo.svg"');
export const dynamic = new URL(file, import.meta.url);
export const base = new URL('./logo.svg', 'https://example.com');
export const single = new URL('https://example.com');
export function shadow(URL) { return new URL('./logo.svg', import.meta.url); }
