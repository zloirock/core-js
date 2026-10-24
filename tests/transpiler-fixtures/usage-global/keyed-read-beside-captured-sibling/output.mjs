import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
// A keyed read under a hop beside a sibling the capture splits off: the capture's own receiver ref
// proves the hop's slot as a source name does, so the hop mirrors and binds no ref nothing reads,
// the key runs once where the source wrote it, and the sibling reads the capture.
function make() {
  log('make');
  return {
    w: Array,
    v: Object,
    n: Number,
    other: 1
  };
}
const {
  w: {
    [(log('from'), 'from')]: from
  },
  other
} = make();
let {
  v: {
    [(log('entries'), 'entries')]: entries,
    values
  },
  other: second
} = make();
export function inside() {
  var {
    n: {
      [(log('isInteger'), 'isInteger')]: isInteger
    },
    other: third
  } = make();
  return [isInteger, third];
}
export const {
  w: {
    [(log('of'), 'of')]: of
  },
  other: fourth
} = make();
for (const {
  v: {
    [(log('assign'), 'assign')]: assign
  },
  other: fifth
} = make();;) {
  use(assign, fifth);
  break;
}
use(from, other, entries, values, second);