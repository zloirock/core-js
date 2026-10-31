// a `||` whose left always yields - a call returning a container, a const alias of one, a store of such
// a call - leaves its right dead: the slot reads the left's container alone
function make() {
  return { C: Reflect };
}
export const { C: { getPrototypeOf } } = make() || { C: Object };
const box = { D: Iterator };
export const { D: { from } } = box || { D: Array };
let stash;
function build() {
  return { E: Map };
}
export const { E: { groupBy } } = (stash = build()) || { E: Object };
export { stash };
