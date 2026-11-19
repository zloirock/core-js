// A consumed initializer keeps the getter after its prefix, exactly once.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const holder = {
  get box() {
    eff("box");
    return [7];
  }
};
const {
  at
} = (eff("p"), holder.box);
r = at.call([7], 0);
