import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
class Bare {}
class Plain extends Bare {}
// nothing of that name is inherited, so no extraction can rebind anything - the narrow is correct
export function noInheritedInstanceMethodKeepsNarrow() {
  var _ref;
  class Bare {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  const held = Sub.prototype.absent;
  return [held, _includesMaybeArray(_ref = Sub.items).call(_ref, "x")];
}