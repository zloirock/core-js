// A prior pure extraction keeps its iterator sentinel beside the explicit helper read.
// A later pass preserves both source reads without extracting the sentinel again.
import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';

export function read(extra) {
  const { w: { [iteratorKey]: _unused } } = { ...extra, w: globalThis };
  const method = getIteratorMethod(globalThis);
  return method;
}

export function readReturned(extra) {
  const { w: { [iteratorKey]: _unused2 } } = { ...extra, w: globalThis };
  return getIteratorMethod(globalThis);
}

export function readThrown(extra) {
  const { w: { [iteratorKey]: _unused3 } } = { ...extra, w: globalThis };
  throw getIteratorMethod(globalThis);
}

export function readEffect(extra) {
  const { w: { [iteratorKey]: _unused4 } } = { ...extra, w: globalThis };
  getIteratorMethod(globalThis);
}

export function readVoid(extra) {
  const { w: { [iteratorKey]: _unused5 } } = { ...extra, w: globalThis };
  void getIteratorMethod(globalThis);
}

export function * readYield(extra) {
  const { w: { [iteratorKey]: _unused6 } } = { ...extra, w: globalThis };
  yield getIteratorMethod(globalThis);
}

export async function readAwait(extra) {
  const { w: { [iteratorKey]: _unused7 } } = { ...extra, w: globalThis };
  return await getIteratorMethod(globalThis);
}
