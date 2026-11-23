// An opaque throwing getter keeps the original pattern and prefix.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const holder = {
  get box() {
    eff("box");
    throw new RangeError();
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
