import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The header sink retains the sequence prefix before reading the getter-backed container.
const holder = {
  get box() {
    effect('get');
    return {
      A: Array
    };
  }
};
for (const {
  A: {
    from
  }
} = (effect('prefix'), holder.box);;) {
  use(from([7]));
  break;
}