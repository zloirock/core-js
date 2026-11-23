// The known return shape admits extraction; the getter can still throw before the binding.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
  if (x === "box") throw new RangeError();
}
const holder = {
  get box() {
    eff("box");
    return { A: Array };
  }
};
try {
  const {
    A: {
      from
    }
  } = (eff("p"), holder.box);
  r = typeof from;
} catch (error) {
  r = error.name;
}
