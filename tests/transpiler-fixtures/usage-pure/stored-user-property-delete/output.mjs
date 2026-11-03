import _globalThis from "@core-js/pure/actual/global-this";
// Deleting through a stored user object must not delete a property of the realm.
let held;
export const result = delete (held = _globalThis.host).window.Promise;
export { held };