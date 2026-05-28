import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// open-annotation (`: any`) suppresses the typed dispatch, so the field's runtime shape
// has to come from module-wide RHS writes. class-side falls back to the field-flow scan when
// the annotation resolves to nothing; object-side synthesises candidates from external writes
// alone via the no-prop fallback. both routes must produce array narrow (_atMaybeArray /
// _includesMaybeArray) on these distinct methods to confirm each path fired independently
class Foo {
  static bar: any = null;
}
Foo.bar = [1, 2, 3];
_atMaybeArray(_ref = Foo.bar).call(_ref, 0);
const Bar: any = {};
Bar.items = ["x", "y"];
_includesMaybeArray(_ref2 = Bar.items).call(_ref2, "x");