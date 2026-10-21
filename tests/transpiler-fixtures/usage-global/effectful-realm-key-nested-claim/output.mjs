import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Global detection keeps the source access and still detects both the key and static leaf claims.
const effects = [];
export const value = (globalThis[effects.push('key'), 'window']?.self).Array.of(2);
export { effects };