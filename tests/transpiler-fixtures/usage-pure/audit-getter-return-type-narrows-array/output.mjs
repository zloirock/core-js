import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// a getter (kind 'get') must yield its DECLARED return type, not the enclosing Function, so a
// method call on the accessed property narrows to the declared receiver. here both getters return
// number[], so each instance method call substitutes the array-specific receiver-less helper. two
// methods so each line's import is distinct.
class C {
  get rows(): number[] {
    return [1];
  }
}
_includesMaybeArray(_ref = new C().rows).call(_ref, 1);
_atMaybeArray(_ref2 = new C().rows).call(_ref2, 0);