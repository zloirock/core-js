import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
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
  },
  other
} = (log('box'), box);
const holder = {
  v: Object,
  more: 2
};
let n = 0;
let {
  v: {
    [(log('keys'), 'keys')]: keys
  },
  more
} = (n++, holder);
use(from, other, keys, more, n);