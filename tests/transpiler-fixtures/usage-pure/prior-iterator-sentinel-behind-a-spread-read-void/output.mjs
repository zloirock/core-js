import _globalThis from "@core-js/pure/actual/global-this";
// A prior pure extraction keeps its iterator sentinel beside the explicit helper read.
// A later pass preserves both source reads without extracting the sentinel again.
import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';
export function readVoid(extra) {
  const {
    w: {
      [iteratorKey]: _unused5
    }
  } = {
    ...extra,
    w: _globalThis
  };
  void getIteratorMethod(_globalThis);
}