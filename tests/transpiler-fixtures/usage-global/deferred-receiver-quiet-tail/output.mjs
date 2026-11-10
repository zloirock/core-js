import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A consumed initializer keeps the getter after its prefix, exactly once.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const holder = {
  get box() {
    eff("box");
    return {
      A: Array
    };
  }
};
const {
  A: {
    from
  }
} = (eff("p"), holder.box);
r = typeof from;