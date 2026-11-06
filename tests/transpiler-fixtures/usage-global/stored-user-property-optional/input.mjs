// A self property of a stored user object can be absent; its guard remains live.
let held;
export const value = (held = globalThis.host).self?.list.at(0);
export { held };
