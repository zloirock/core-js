import _globalThis from "@core-js/pure/actual/global-this";
// A prior pure extraction keeps its iterator sentinel beside the explicit helper read.
// A later pass preserves both source reads without extracting the sentinel again.
import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';
export function readReturned(extra) {
  const {
    w: {
      [iteratorKey]: _unused2
    }
  } = {
    ...extra,
    w: _globalThis
  };
  return getIteratorMethod(_globalThis);
}