import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a container or a realm root written in the arm a decided presence test always takes holds that value
// at the read, so the static read off it claims its pure static - a member read and a destructure alike.
// an undecided test may leave the init in place, so its read stays native
let box = {
  C: Object
};
if (typeof _Promise != 'undefined') box = {
  C: _Map
};
export const grouped = () => _Map$groupBy([1], x => x);
let root;
if (typeof _globalThis != 'undefined') root = _globalThis;
export const fromRoot = () => {
  const from = _Array$from;
  return from([1]);
};
let maybe = {
  C: Object
};
if (flag) maybe = {
  C: Array
};
export const undecided = () => maybe.C.of(1);