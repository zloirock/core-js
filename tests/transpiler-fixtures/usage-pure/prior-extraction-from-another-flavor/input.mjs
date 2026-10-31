// A prior extraction remains recognizable when the next pass uses another flavor.
// Its unread pattern leaves keep the original reads beside the explicit pure values.
import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import readIterator from '@core-js/pure/actual/get-iterator-method';
import { default as from } from '@core-js/pure/actual/array/from';

export function read(extra) {
  const { w: { [iteratorKey]: _unused } } = { ...extra, w: globalThis };
  return readIterator(globalThis);
}

export function readStatic(extra) {
  const { A: { from: _unused2 } } = { ...extra, A: Array };
  return from;
}
