import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Terminal, delete and backed-root consumers retain the base under an effectful realm key.
export const read = () => _globalThis.window[effect(), 'self'];
export const remove = () => delete _globalThis.window[effect(), 'self'].missing;
export const backed = () => _self.window[effect(), 'self'];