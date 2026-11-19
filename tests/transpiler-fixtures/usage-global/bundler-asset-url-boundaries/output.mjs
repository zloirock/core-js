import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url-search-params.constructor";
// Ordinary URL construction still polyfills; only the bundler's source pattern stays native.
const file = JSON.parse('"./logo.svg"');
export const dynamic = new URL(file, import.meta.url);
export const base = new URL('./logo.svg', 'https://example.com');
export const single = new URL('https://example.com');
export function shadow(URL) {
  return new URL('./logo.svg', import.meta.url);
}