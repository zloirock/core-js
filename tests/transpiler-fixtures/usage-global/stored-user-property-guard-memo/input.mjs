// An outer store keeps the possibly absent value of the user's self property.
let held, inner;
export const value = (held = (inner = globalThis.host).self)?.list.includes(1);
export { held, inner };
