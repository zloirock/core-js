import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a binding holding a selection of containers holds whichever arm ran, so a write of a slot through the
// binding, or the binding leaving to a call, reaches the slot a later read takes - even where the build
// decides the selection, the slot holds what the write put there
const box = {
  C: _Map
};
box.C = Object;
export const grouped = box.C.groupBy([1, 2], x => x % 2);
const holder = {
  C: Array
};
holder.C = _Iterator;
export const listed = holder.C.from([1]);
const shared = {
  C: _Promise
};
install(shared);
export const settled = shared.C.allSettled([]);