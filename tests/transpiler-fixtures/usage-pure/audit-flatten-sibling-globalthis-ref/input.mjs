// multi-declarator: first declarator is a flattened `globalThis` proxy destructure;
// sibling holds a bare `globalThis` reference that must also be rewritten to the
// polyfill binding even though it sits outside any arrow / function body
const { Array: { from } } = globalThis, host = globalThis;
export { from, host };
