import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
class Loop extends Knot {}
class Knot extends Loop {}
class Plain extends Loop {}
// the same cycle with no static anywhere in it: nothing rebinds `this`, so the narrow is correct
export function cyclicChainWithoutStaticKeepsNarrow() {
  var _ref;
  class Loop {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref = Sub.items).call(_ref, "x");
}