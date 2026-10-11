import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A prefixed receiver beside a sibling: the capture spells the prefix ahead of the re-read name in
// a sequence it builds, and the mirror finds that name inside it - the prefix runs once ahead of the
// literal, the key once in the pattern, and no hop ref is bound.
const box = {
  w: Array,
  other: 1
};
const {
    w: {
      [(log('from'), 'from')]: from
    }
  } = (log('box'), {
    w: {
      from: _Array$from
    }
  }),
  {
    other
  } = box;
const holder = {
  v: Object,
  more: 2
};
let n = 0;
let {
    v: {
      [(log('keys'), 'keys')]: keys
    }
  } = (n++, {
    v: {
      keys: _Object$keys
    }
  }),
  {
    more
  } = holder;
use(from, other, keys, more, n);