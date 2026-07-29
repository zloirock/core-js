// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed,
// and an inline default fills a leaf the caller deliberately left undefined. That is sound only
// where every call site is visible. The two immediately-invoked hosts below are rewritten; every
// other host keeps its parameters verbatim and is served by global injection instead.
// The pattern is the same in all seven rows, so the host is the only variable; the two invoked
// rows differ only in body shape, which is what picks the inline default over the hoisted binding.
const G = globalThis;

export const iifeArrow = (([{ Set, Array: { from } } = G]) => [Set, from])([]);

export const iifeBlockBody = (([{ Map, Array: { of } } = G]) => {
  return [Map, of];
})([]);

export function exportedDeclaration([{ WeakSet, Array: { from } } = G]) {
  return [WeakSet, from];
}

function localDeclaration([{ WeakMap, Array: { of } } = G]) {
  return [WeakMap, of];
}

export const exportedArrow = ([{ Promise, Array: { from } } = G]) => [Promise, from];

const assignedThenCalled = ([{ Set: S, Array: { of: o } } = G]) => [S, o];

export const objectMethod = {
  m([{ Map: M, Array: { from: f } } = G]) {
    return [M, f];
  }
};

export const called = assignedThenCalled([]);
export { localDeclaration };
