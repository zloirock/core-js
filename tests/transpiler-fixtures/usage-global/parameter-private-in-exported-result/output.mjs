import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Exporting an IIFE result does not export its private function's callable identity.
// Its supplied argument is consumed by the pattern and can receive the static polyfill.
export const result = (() => {
  function read({
    from
  } = Array) {
    return from;
  }
  return read(Array)([7]);
})();