import _globalThis from "@core-js/pure/actual/global-this";
// for-of's left slot accepts a single VariableDeclaration that introduces the iteration
// binding. flattening `{Array:{from}}` into `const from = _Array$from;` (a STATEMENT)
// corrupts the for-of header into invalid syntax. flatten must bail on for-of / for-in
// left declarations - the iterated value rebinds `from` each iteration anyway, so the
// extracted polyfill identifier would be overwritten on every step. fall back to the
// native binding (user gets `Array.from` per iteration, matching unmodified semantics)
for (const {
  Array: {
    from
  }
} of [_globalThis]) {
  from([1]);
}