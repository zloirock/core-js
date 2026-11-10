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
      A: Array,
      other: 3
    };
  }
};
const {
  A: {
    from
  },
  other
} = (eff("p"), holder.box);
r = [typeof from, other];
