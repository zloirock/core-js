import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// An effectful residual key reads the earlier extracted binding.
// Capture the initializer before binding it, then evaluate the key.
const holder = {
  get A() {
    note('init');
    return Array;
  }
};
const {
  from,
  [(note(typeof from), 'of')]: of
} = holder.A;
use(of(7));