// Rest requires the full constructor family even without a named static.
const { Promise: { ...rest } } = globalThis;
export { rest };
