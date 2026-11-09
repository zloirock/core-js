import _URL from "@core-js/pure/actual/url/constructor";
// Ordinary URL construction still polyfills; only the bundler's source pattern stays native.
const file = JSON.parse('"./logo.svg"');
export const dynamic = new _URL(file, import.meta.url);
export const base = new _URL('./logo.svg', 'https://example.com');
export const single = new _URL('https://example.com');
export function shadow(URL) {
  return new URL('./logo.svg', import.meta.url);
}