// An effectful sibling before the nested static keeps its position and local receiver temporary.
const kls = (() => { return [].values(); })(), { Array: { from } } = globalThis;
export { from, kls };
