import _Array$from from "@core-js/pure/actual/array/from";
// A discarded nested assignment gives the binding the pure static unconditionally.
// A native-only fallback would incorrectly prefer a buggy present implementation.
let from;
({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
});
export const arr = from([1, 2, 3]);