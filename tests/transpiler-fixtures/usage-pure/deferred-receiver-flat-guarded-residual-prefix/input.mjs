// The flat guarded residual keeps its prefix and receiver read together, once.
export let r;
export const effects = [];
function record(value) {
  effects[effects.length] = value;
}
class Box {
  static get value() {
    record('get');
    return globalThis;
  }
}
const { groupBy, other } = (record('prefix'), Box.value.Map);
r = [typeof groupBy, typeof other];
