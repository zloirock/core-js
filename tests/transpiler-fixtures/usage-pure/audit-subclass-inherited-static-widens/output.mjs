import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an INHERITED static extracted through the subclass binding (`Sub.read`) rebinds `this`
// away from the base at its later invocation - the ancestors' static sets merge into the
// method-aware classifier, so the extraction widens the base field narrow exactly like
// an own-static extraction does
class Base {
  data = [1, 2];
  static read(o) {
    var _ref;
    return _at(_ref = o.data).call(_ref, 0);
  }
}
class Sub extends Base {}
const extracted = Sub.read;
export const viaInheritedExtract = extracted;

// own-static control (covered sibling): extraction off the declaring class widens too
class Solo {
  data = [3, 4];
  static read(o) {
    var _ref2;
    return _includes(_ref2 = o.data).call(_ref2, 3);
  }
}
const ownExtracted = Solo.read;
export const viaOwnExtract = ownExtracted;