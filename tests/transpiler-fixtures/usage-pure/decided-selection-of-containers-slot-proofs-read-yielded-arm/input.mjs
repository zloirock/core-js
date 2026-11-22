// A decided selection holds one container. Destructuring after the write reads Object's static.
// Passing the other container to a read-only function preserves its original slot.
const written = typeof Symbol != 'undefined' ? { C: Map } : { C: Set };
written.C = Object;
export const { C: { groupBy } } = written;
const peeked = { C: Promise } || { C: Set };
function peek(target) {
  return target.C;
}
export const held = peek(peeked);
export const settled = peeked.C.allSettled([]);
