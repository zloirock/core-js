import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// a binding holding a selection of containers the build decides holds the container the selection yields,
// and the slot proofs read that container as they read a plain one: a write before the read replaces its
// slot - a destructure off it stays native, with no identity guard naming the replaced constructor - and a
// call that only reads the slot leaves it, so the static read through it is substituted
const written = {
  C: _Map
};
written.C = Object;
export const {
  C: {
    groupBy
  }
} = written;
const peeked = {
  C: _Promise
};
function peek(target) {
  return target.C;
}
export const held = peek(peeked);
export const settled = _Promise$allSettled([]);