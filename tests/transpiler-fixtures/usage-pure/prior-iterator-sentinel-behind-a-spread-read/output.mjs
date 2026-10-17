import _globalThis from "@core-js/pure/actual/global-this";
// A prior pure extraction keeps its iterator sentinel beside the explicit helper read.
// A later pass preserves both source reads without extracting the sentinel again.
import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';
export function read(extra) {
  const {
    w: {
      [iteratorKey]: _unused
    }
  } = {
    ...extra,
    w: _globalThis
  };
  const method = getIteratorMethod(_globalThis);
  return method;
}