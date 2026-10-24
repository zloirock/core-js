// A user slot off top-level this can hold an instance, regardless of the key's case.
// Unknown values take generic dispatch through aliases and loop heads, preserving the capture.
// A prefix stays in the receiver/member read or leads the default guard, once.
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
// An unknown slot still dispatches its iterable instance before the leaf default.
let iterator;
({ Data: { [Symbol.iterator]: iterator = null } } = this);
export { at, includes, flat, read, map, filter, sibling, capturedRealm, ownReceiver, iterator };
