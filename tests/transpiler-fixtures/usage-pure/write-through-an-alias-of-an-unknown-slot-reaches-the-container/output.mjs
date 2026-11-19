import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a write through a name holding a slot read by a key no canon names lands somewhere under the container
// that slot sits in, as the write spelled through the slot does, so a static read of a slot under it takes
// the entry carrying the written constructor's statics - a hop off the container itself or off a member of
// it, a known or an unknown key written
const box = {
  inner: {
    C: Array
  }
};
const slot = box[k];
slot.C = _Iterator;
export const copied = box.inner.C.from([1]);
const nest = {
  list: {
    a: {
      D: Object
    }
  }
};
const deep = nest.list[i];
deep.D = _Map;
export const grouped = nest.list.a.D.groupBy([1], x => x);
const pool = {
  a: {
    E: Object
  }
};
const each = pool[i];
each[j] = _Promise;
export const settled = pool.a.E.allSettled([]);