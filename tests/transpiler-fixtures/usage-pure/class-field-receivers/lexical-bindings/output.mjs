import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// Receiver capture in an instance field keeps the field's enclosing lexical environment.
// this and super select this instance; new.target keeps its field-initializer value.
class Base {
  get data() {
    return [1, [2]];
  }
}
export class Box extends Base {
  value = (() => {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  })();
  found = (() => {
    var _ref2;
    return _includesMaybeArray(_ref2 = super.data).call(_ref2, 1);
  })();
  flattened = (() => {
    var _ref3;
    return _flatMaybeArray(_ref3 = new.target?.data || this.data).call(_ref3);
  })();
}