import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A discarded initializer stays between its preceding and following declarators.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
const before = effect(),
  {
    A: {
      from
    }
  } = holder.box,
  after = effect();
use(before, from, after);