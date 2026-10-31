// Top-level this is a global proxy. Usage-global retains conservative instance imports
// for unknown user slots across declarations, assignments, aliases and loop heads.
// A sequence prefix stays on the receiver or inside its member read, and runs once.
const { Data: { at } } = this;
const { data: { includes } } = this;
let flat;
({ Data: { flat } } = this);
const read = () => {
  const { data: { findLast } } = this;
  return findLast;
};
const { Data: { map }, sibling } = this;
const realm = this;
const { data: { filter } } = realm;
const { Data: { join = /* method default */ fallback(/*#__PURE__*/ getA().toSorted()) } } = (/* receiver prefix */ touch(), this);
for (const { Data: { find } } of [this]) consume(find);
function capturedRealm() {
  const { data: { findIndex } } = realm;
  return findIndex;
}
function ownReceiver() {
  const { Data: { flatMap } } = this;
  return flatMap;
}
export { at, includes, flat, read, map, filter, sibling, capturedRealm, ownReceiver };
