// Deleting through a stored user object must not delete a property of the realm.
let held;
export const result = delete (held = globalThis.host).window.Promise;
export { held };
