import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$isExtensible from "@core-js/pure/actual/object/is-extensible";
import _Object$isFrozen from "@core-js/pure/actual/object/is-frozen";
import _Object$isSealed from "@core-js/pure/actual/object/is-sealed";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set";
var _ref6;
// a `||` / `??` whose left is a for-of head over an inline literal - the head itself, of any declaration
// kind, or a pattern head's slot of an element written in place - read in the loop's body holds one element
// per pass: where every element is a built-in the right never runs, so nothing is read or loaded for it. a
// head that may hold anything else keeps it: an element that may be falsy, a written or shadowed binding, a
// container read by name, a read before the head ran, an element reading the head itself
for (const M of [_Map, Array]) use(M === _Map ? _Map$groupBy : M.groupBy);
for (const S of [_Set, Array]) use(S.fromEntries);
for (const [P] of [[_Promise], [Array]]) use(P.hasOwn);
for (const {
  C
} of [{
  C: _Map
}, {
  C: Array
}]) use(C.is);
for (var V of [_Map, _Set]) use(V.freeze);
for (const N of [_Map, shim]) {
  var _ref;
  use((_ref = N || Object, _ref === Object ? _Object$assign : _ref.assign));
}
for (let W of [_Set, Array]) {
  var _ref2;
  if (c) W = null;
  use((_ref2 = W || Object, _ref2 === Object ? _Object$getOwnPropertyDescriptors : _ref2.getOwnPropertyDescriptors));
}
for (const I of [_Iterator, Array]) {
  var _ref3;
  let I = pick();
  use((_ref3 = I || Object, _ref3 === Object ? _Object$isSealed : _ref3.isSealed));
}
for (const F of [_Map, _Set]) use(F => {
  var _ref4;
  return _ref4 = F || Object, _ref4 === Object ? _Object$seal : _ref4.seal;
});
const box = {
  C: _Promise
};
box.C = null;
for (const {
  C
} of [box]) {
  var _ref5;
  use((_ref5 = C || Object, _ref5 === Object ? _Object$getOwnPropertyNames : _ref5.getOwnPropertyNames));
}
for (var Q of [(use((_ref6 = Q || Object, _ref6 === Object ? _Object$isFrozen : _ref6.isFrozen)), _Map), _Set]) use(Q);
for (const Y of [Y]) {
  var _ref7;
  use((_ref7 = Y || Object, _ref7 === Object ? _Object$isExtensible : _ref7.isExtensible));
}