// A constructor entry makes its index the source of both named properties and rest.
let allSettled, inner, outer;
const held = ({ Promise: { allSettled, ...inner }, ...outer } = globalThis);
export { held, allSettled, inner, outer };
