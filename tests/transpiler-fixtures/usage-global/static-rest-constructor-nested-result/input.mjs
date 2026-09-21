// Nested constructor rest requires the full family; the outer result stays intact.
let race, rest;
const held = ({ Promise: { race, ...rest } } = globalThis);
export { held, race, rest };
