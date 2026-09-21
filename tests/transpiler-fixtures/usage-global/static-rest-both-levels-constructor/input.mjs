// Constructor rest requires the full family, including non-enumerable statics.
let allSettled, inner, outer;
const held = ({ Promise: { allSettled, ...inner }, ...outer } = globalThis);
export { held, allSettled, inner, outer };
