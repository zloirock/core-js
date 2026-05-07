import _Array$from from "@core-js/pure/actual/array/from";
import _Object$values from "@core-js/pure/actual/object/values";
// multi-decl flatten + sibling IIFE with static call (no _ref needed). asserts the issue
// is specifically the var _ref insert vs full-declaration overwrite collision and not
// any inner transform inside sibling
const from = _Array$from;
const kls = (() => {
  return _Object$values({
    a: 1
  });
})();
export { from, kls };