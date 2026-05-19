// `Promise?.resolve(...)` access where `Promise` is shadowed by a local TS-runtime
// binding (enum) inside the same function. `skipPolyfillableOptional`'s
// `adapter.hasBinding(scope, name, path)` is now anchored at the reference path -
// the path walks TS-runtime declarations (`enum`, `namespace`, `import X = require`)
// at the use site rather than starting at the enclosing scope's owner, which
// estree-toolkit's scope tracker reports as the FunctionDeclaration (not the
// enum's containing block). without the path anchor the enum shadow would be
// missed, the lookup would fall through to the global `Promise`, and the
// polyfill rewrite would incorrectly retarget the local enum access
function probe() {
  enum Promise { Pending, Fulfilled, Rejected }
  return Promise?.Pending;
}
export { probe };