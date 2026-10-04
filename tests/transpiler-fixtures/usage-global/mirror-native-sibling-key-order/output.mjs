import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A native sibling may have a getter. Read it after the effectful constructor key.
const events = [];
const {
  [(events.push('key'), 'Array')]: {
    from
  },
  sibling
} = globalThis;
use(from([7]), sibling, events);