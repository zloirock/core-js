// multi-decl where one declarator is a flattenable nested proxy-destructure and the sibling
// references a polyfillable global (bare identifier or static member access). flatten's
// raw-text reuse of the sibling routes the identifier visitor to the sibling's globals so
// its transform composes into the outer's replacement and every sibling reference reaches
// its polyfill at runtime
const { Array: { from } } = globalThis, y = globalThis;
const { Map: { groupBy } } = self, sym = Symbol.iterator;
export { from, y, groupBy, sym };
