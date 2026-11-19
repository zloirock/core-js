// Inner constructor rest requires the full family; outer rest keeps its own source.
const { Promise: { any, ...inner }, ...outer } = globalThis;
export { any, inner, outer };
