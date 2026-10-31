import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
// the composed two-step over an UNTYPED receiver: nothing says what the value is, so the outer hop
// dispatches GENERICALLY - the surface is what the hop reads, and the key names it whatever the
// receiver turns out to be. spelling the hop raw fired the source's default on the very path the
// ponyfill answers, which is the arm a foreign receiver actually takes
function viaParam(o) {
  var _ref;
  const viaHop = _nameMaybeFunction((_ref = _at(o)) === void 0 ? {} : _ref);
  return viaHop;
}
export { viaParam };