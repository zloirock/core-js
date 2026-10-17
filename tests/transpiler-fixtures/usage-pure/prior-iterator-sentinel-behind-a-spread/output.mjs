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
export function readThrown(extra) {
  const {
    w: {
      [iteratorKey]: _unused3
    }
  } = {
    ...extra,
    w: _globalThis
  };
  throw getIteratorMethod(_globalThis);
}
export function readEffect(extra) {
  const {
    w: {
      [iteratorKey]: _unused4
    }
  } = {
    ...extra,
    w: _globalThis
  };
  getIteratorMethod(_globalThis);
}
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
export function* readYield(extra) {
  const {
    w: {
      [iteratorKey]: _unused6
    }
  } = {
    ...extra,
    w: _globalThis
  };
  yield getIteratorMethod(_globalThis);
}
export async function readAwait(extra) {
  const {
    w: {
      [iteratorKey]: _unused7
    }
  } = {
    ...extra,
    w: _globalThis
  };
  return await getIteratorMethod(_globalThis);
}