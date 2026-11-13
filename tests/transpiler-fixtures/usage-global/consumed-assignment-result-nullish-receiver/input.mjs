// Returning the assignment source must not replace its required nullish coercion.
let of;
export const value = ({ of } = globalThis.window?.Array);
export { of };
