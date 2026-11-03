import _globalThis from "@core-js/pure/actual/global-this";
// A realm root below a stored user property cannot replace the user's receiver.
let held;
export const value = (held = _globalThis.host.links).self.href;
export { held };