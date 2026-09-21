// Nested constructor rest requires the full family beside the named static.
const { Promise: { all, ...rest } } = globalThis;
export { all, rest };
