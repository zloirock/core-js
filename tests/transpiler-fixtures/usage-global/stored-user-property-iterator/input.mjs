// The iterator call receives the user's self object, with the store evaluated once.
let held;
export const value = (held = globalThis.host).self[Symbol.iterator]().next().value;
export { held };
