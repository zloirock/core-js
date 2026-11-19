import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A bodyless assignment still evaluates the getter before binding the static.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
let from;
if (condition) ({
  A: {
    from
  }
} = holder.box);
use(from);