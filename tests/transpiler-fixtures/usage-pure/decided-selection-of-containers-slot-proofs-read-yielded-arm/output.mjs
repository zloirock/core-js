import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A decided selection holds one container. Destructuring after the write reads Object's static.
// Passing the other container to a read-only function preserves its original slot.
const written = {
  C: _Map
};
written.C = Object;
export const groupBy = _Object$groupBy;
const peeked = {
  C: _Promise
};
function peek(target) {
  return target.C;
}
export const held = peek(peeked);
export const settled = _Promise$allSettled([]);