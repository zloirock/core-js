import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Static extractions retain their rest exclusions; a sibling must not reclaim the sentinel.
const from = _Array$from;
const [{
  'from': _unused,
  ...rest
}, tail] = [Array, 1];
const of = _Array$of;
const [{
  [_Symbol$iterator]: iterator,
  of: _unused2,
  ...remaining
}] = [Array];
export const r = [from([tail]), of(2), typeof iterator, _Object$hasOwn(rest, 'from'), _Object$hasOwn(remaining, 'of')];