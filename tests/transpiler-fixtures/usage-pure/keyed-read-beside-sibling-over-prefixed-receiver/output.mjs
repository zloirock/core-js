import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A receiver prefix precedes a nested computed key, then its sibling read.
// Captured from and keys claims retain that source order in const and let hosts.
const box = {
  w: Array,
  other: 1
};
const {
    w: {}
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
    v: {}
  } = (n++, holder),
  keys = (log('keys'), _Object$keys),
  {
    more
  } = holder;
use(from, other, keys, more, n);