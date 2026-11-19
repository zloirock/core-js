import _globalThis from "@core-js/pure/actual/global-this";
// A store of a user object keeps the write on that object's window property.
let held;
(held = _globalThis.host).window.Promise = replacement;
export { held };