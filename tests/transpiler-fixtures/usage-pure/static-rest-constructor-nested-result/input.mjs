// The inner constructor index does not replace the outer assignment result.
let race, rest;
const held = ({ Promise: { race, ...rest } } = globalThis);
export { held, race, rest };
