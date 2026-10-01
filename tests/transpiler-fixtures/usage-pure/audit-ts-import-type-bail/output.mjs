import _at from "@core-js/pure/actual/instance/at";
// `import('./remote').RemoteArray` type reference requires reading the target module's
// exports to resolve the element type. plugin doesn't do file I/O - the resolver returns
// null and `.at(0)` falls back to the generic instance polyfill (correct but less precise
// than the array-specific variant it would pick if the type were resolvable locally)
declare const x: import('./remote').RemoteArray;
const first = _at(x).call(x, 0);
export { first };