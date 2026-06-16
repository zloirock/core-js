import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested instance method in a FOR-INIT header. the loop header can't host a preceding `const _ref` or a
// dropped declaration, so the polyfill binds as a trailing sibling declarator (`, at = _flatMaybeArray([..])`)
// and NEITHER memoization NOR elimination fires - the constant receiver is re-emitted in place. locks the
// negative gate: a sibling-declarator host opts out of both optimizations on both emitters
for (const {
    b: {
      flat: _unused
    }
  } = {
    b: [1, [2]]
  }, flat = _flatMaybeArray([1, [2]]); false;) flat();