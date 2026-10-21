import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const box = {
  w: Array,
  other: 1
};
const {
    w: _ref
  } = (log('box'), box),
  from = (log('from'), _Array$from),
  {
    other
  } = box;
const holder = {
  v: Object,
  more: 2
};
let n = 0;
let {
    v: _ref2
  } = (n++, holder),
  keys = (log('keys'), _Object$keys),
  {
    more
  } = holder;
use(from, other, keys, more, n);