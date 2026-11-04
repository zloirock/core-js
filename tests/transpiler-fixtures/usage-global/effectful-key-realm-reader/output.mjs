import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Terminal, delete and backed-root consumers retain the base under an effectful realm key.
export const read = () => globalThis.window[effect(), 'self'];
export const remove = () => delete globalThis.window[effect(), 'self'].missing;
export const backed = () => globalThis.self.window[effect(), 'self'];