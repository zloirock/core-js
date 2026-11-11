import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A native sibling default follows the nested static it reads.
// The realm getter runs once before either binding.
const holder = {
  get realm() {
    note('init');
    return globalThis;
  }
};
const {
  Array: {
    from
  },
  make = from
} = holder.realm;
use(make([7]));