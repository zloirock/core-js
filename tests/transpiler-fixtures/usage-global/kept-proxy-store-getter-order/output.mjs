import "core-js/modules/es.global-this";
// A getter in the stored value runs once before the static is bound.
// Static inference through this stored getter result declines; keep its native read.
const source = {
  get realm() {
    mark();
    return globalThis;
  }
};
let held;
export const {
  from: read
} = (held = (effect(), source.realm)).Array;
export { held };