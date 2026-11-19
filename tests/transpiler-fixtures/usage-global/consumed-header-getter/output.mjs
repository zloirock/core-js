import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The nested static consumes the pattern, not its initializer getter.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
for (let {
    A: {
      from
    }
  } = holder.box, i = 0; i < 1; i++) use(from);