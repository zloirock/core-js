import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Global detection keeps the optional access and detects the independent claim in its key.
const effects = [];
export const value = (globalThis.window?.[effects.push('key'), 'self']).customQ;
export { effects };