// Three-level nesting with inner default: `function({a: {b: {entries} = Map} = inner} = outer)`.
// Probes whether the destructuring-init metadata resolves the innermost `entries` against `Map`
// (the third-level AssignmentPattern.right) and emits Map.entries polyfill, rather than
// falling back to outer `inner` or `outer` typeless metas.
function f({ a: { b: { entries } = Map } = { b: undefined } } = { a: undefined }) {
  return entries;
}
export { f };
