// A nested constructor rest reads named properties from the same pure index.
const { Promise: { all, ...rest } } = globalThis;
export { all, rest };
