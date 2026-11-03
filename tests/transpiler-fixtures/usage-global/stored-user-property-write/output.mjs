import "core-js/modules/es.global-this";
// A store of a user object keeps the write on that object's window property.
let held;
(held = globalThis.host).window.Promise = replacement;
export { held };