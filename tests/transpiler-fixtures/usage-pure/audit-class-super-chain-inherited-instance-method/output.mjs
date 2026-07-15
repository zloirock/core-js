import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// the chain walk unions the ancestors' INSTANCE sets too, not just their statics: a `<Class>.prototype`
// hop reaches an inherited method through the prototype chain, and extracting one rebinds `this` away
// from the instance exactly the way an extracted static rebinds it away from the constructor. so the
// hop must land on the real ancestor here as well - an inner class of its name answering instead leaves
// the inherited method unseen and a field narrow alive that the extracted method can retype
class Reader {
  read() {
    this.items = "poison";
    return 1;
  }
}
class Base extends Reader {}
class Bare {}
class Plain extends Bare {}

// the inherited `read` IS extracted off the prototype, so the narrow must widen
export function inheritedInstanceMethodExtractedDropsNarrow() {
  var _ref;
  class Reader {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  const held = Sub.prototype.read;
  return [held, _at(_ref = Sub.items).call(_ref, 0)];
}

// nothing of that name is inherited, so no extraction can rebind anything - the narrow is correct
export function noInheritedInstanceMethodKeepsNarrow() {
  var _ref2;
  class Bare {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  const held = Sub.prototype.absent;
  return [held, _includesMaybeArray(_ref2 = Sub.items).call(_ref2, "x")];
}