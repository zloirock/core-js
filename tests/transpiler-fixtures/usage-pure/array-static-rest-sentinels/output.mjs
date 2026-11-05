import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Static extractions retain their rest exclusions; a sibling must not reclaim the sentinel.
const [{
  'from': from,
  ...rest
}, tail] = [Array, 1];
const [{
  [_Symbol$iterator]: iterator,
  of,
  ...remaining
}] = [Array];
export const r = [from([tail]), of(2), typeof iterator, _Object$hasOwn(rest, 'from'), _Object$hasOwn(remaining, 'of')];