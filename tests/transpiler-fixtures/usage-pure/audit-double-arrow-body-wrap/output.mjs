import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// nested arrow expression bodies, each with an instance-method chain that needs
// single-evaluation memoization. inner arrow body must convert to a block and keep
// its `_ref` var local rather than hoisting it to the outer arrow's params
const g = x => (y => {
  var _ref;
  return _flatMaybeArray(_ref = _at(x).call(x, y)).call(_ref);
})(0);