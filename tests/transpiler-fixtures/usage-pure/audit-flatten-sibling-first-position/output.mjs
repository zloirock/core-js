import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// flatten declarator NOT first in multi-decl - sibling IIFE block-body precedes the
// flattenable destructure. asserts the bug fires regardless of declarator order in
// the multi-decl
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
const from = _Array$from;
export { from, kls };