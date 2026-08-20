import _globalThis from "@core-js/pure/actual/global-this";
// for-of's left slot holds the VariableDeclaration that introduces the iteration binding.
// flattening `{Array:{from}}` into a `const from = _Array$from;` STATEMENT corrupts the for-of
// header, and the iterated value rebinds `from` each step anyway. flatten must bail on for-of /
// for-in left declarations and fall back to the native binding.
for (const {
  Array: {
    from
  }
} of [_globalThis]) {
  from([1]);
}