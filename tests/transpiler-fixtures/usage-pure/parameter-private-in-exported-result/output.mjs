import _Array$from from "@core-js/pure/actual/array/from";
// Exporting an IIFE result does not export its private function's callable identity.
// Its supplied argument is consumed by the pattern and can receive the static polyfill.
export const result = (() => {
  function read({
    from
  } = {
    from: _Array$from
  }) {
    return from;
  }
  return read({
    from: _Array$from
  })([7]);
})();