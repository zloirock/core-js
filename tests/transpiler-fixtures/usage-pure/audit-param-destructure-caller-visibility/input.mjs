// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed,
// and an inline default fills a leaf the caller deliberately left undefined. That is sound only
// where every call site is visible. The mirror of the INNER DEFAULT is not caller-lossy - the default
// fires exactly where the caller's slot holds `undefined`, and the literal then supplies the ponyfills
// the receiver would have supplied natively - so every host takes it: the two immediately-invoked
// hosts (the call leaves the slot empty - no inline default and no hoisted binding beside the mirror),
// the arrow a closed caller census sees called once with an empty array, and the declared, exported,
// local and method hosts whose callers no census closes (the default alone is mirrored, hosted on
// the parameter's own pattern). The pattern is the same in all seven rows, so the host is the only
// variable; the two invoked rows differ only in body shape, and both take the mirror.
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
