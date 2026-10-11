import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
// an alias reads its source where it is declared, so a `var` of the same name in a block of a function the
// use stands in shadows no read the type of a value through the alias asks either: what a static returns off
// a realm alias, off a constructor destructured from an alias, off a constructor destructured from a realm alias
const g = _self;
export function realm(c) {
  var _ref;
  if (c) {
    var self = 1;
  }
  return _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
}
const D = Object;
export function destructuredStatic(c) {
  var _ref2;
  if (c) {
    var Object = 1;
  }
  const values = _Object$values;
  return _includesMaybeArray(_ref2 = values(o)).call(_ref2, 1);
}
const h = _globalThis;
export function realmDestructured(c) {
  var _ref3;
  if (c) {
    var globalThis = 1;
  }
  const {
    Array: A
  } = h;
  return _valuesMaybeArray(_ref3 = _Array$from(o)).call(_ref3);
}