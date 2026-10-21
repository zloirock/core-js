import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
// a selection arm that is a container slot holding several values - a slot a write sets, a slot holding a
// selection, on the host's level or a level below it - is no constructor the destructure can mirror: it stays
// as written, and a static read off it reads the binding pure swapped into the slot, so that constructor takes
// the entry carrying its own statics
const box = {
  M: _Map
};
if (c) box.M = Array;
export const {
  groupBy
} = d ? box.M : {
  groupBy: _Object$groupBy
};
const holder = {
  P: c ? _Promise : Array
};
export const {
  try: attempt
} = d ? holder.P : Object;
const store = {
  I: _Iterator
};
if (c) store.I = Array;
export const {
  W: {
    from
  }
} = {
  W: d ? store.I : Array
};