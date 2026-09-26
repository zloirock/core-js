import _Array$of from "@core-js/pure/actual/array/of";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2;
// A static reached through a call keeps the call, iteration and native read before binding.
// An optional call still performs its native selection, including its nullish failure.
const make = () => [Object, 7];
let keys, tail;
[_ref, _ref2] = make();
const {
  keys: _unused
} = _ref;
keys = _Object$keys;
tail = _ref2;
const build = () => [Array];
const [_ref3] = build?.();
const {
  of: _unused2
} = _ref3;
const of = _Array$of;
use(keys, tail, of);