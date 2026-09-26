// Only the constructor level reads the index; outer rest keeps its realm source.
const { Promise: { any, ...inner }, ...outer } = globalThis;
export { any, inner, outer };
