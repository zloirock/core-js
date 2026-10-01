import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
var _ref;
// a static read through an array slot the literal fills with a call resolves through that call, as a
// read through an object slot does; a slot written after the literal is no longer the call's, and a
// slot holding data stays an instance receiver
function map() {
  return _Map;
}
function iterator() {
  return _Iterator;
}
function promise() {
  return _Promise;
}
function items() {
  return [1, 2];
}
const maps = [map()];
export const grouped = _Map$groupBy([1], x => x);
export const iterated = (iterator(), _Iterator$from)([1]);
const promises = [promise()];
promises[0] = {
  withResolvers: () => 'written'
};
export const resolvers = promises[0].withResolvers();
export const first = _atMaybeArray(_ref = [items()][0]).call(_ref, 0);