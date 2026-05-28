import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// THREE levels of nested arrow bodies, each with instance-method calls that trigger body-
// wraps. only the outermost wrap renders at the top level; inner wraps recursively compose
// into their parent's wrap text. each level emits its own `var _refN;` declaration in
// source-position order
const from = _Array$from;
const sibling = () => {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0) + (() => {
    var _ref2;
    return _atMaybeArray(_ref2 = [2]).call(_ref2, 0) + (() => {
      var _ref3;
      return _atMaybeArray(_ref3 = [3]).call(_ref3, 0);
    })();
  })();
};
console.log(from, sibling());