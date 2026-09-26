import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// A receiver invoker is a call of the function it invokes, so the parameter pairs with the
// argument the pairing places there and a static read off it takes the pure static.
// Each spelling reads a different static; the invoker itself keeps its source spelling.
function viaCall(a) {
  return _Array$of(1);
}
function viaApply(o) {
  return _Object$groupBy([1], x => x);
}
function viaReflect(m) {
  return _Map$groupBy([1], x => x);
}
function viaBind(p) {
  return _Promise$withResolvers();
}
export const call = viaCall.call(null, Array);
export const apply = viaApply.apply(null, [Object]);
export const reflect = _Reflect$apply(viaReflect, null, [_Map]);
export const bound = viaBind.bind(null, _Promise)();