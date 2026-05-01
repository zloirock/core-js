import _Array$from from "@core-js/pure/actual/array/from";
import _Object$values from "@core-js/pure/actual/object/values";
const from = _Array$from;
// static call in sibling: `Object.values(...)` requires polyfill substitution as well.
// asserts whether instance-dispatch is uniquely problematic, or any transform inside
// sibling triggers the chunk-split error
const kls = (() => {
  return _Object$values({
    a: 1
  });
})();
export { from, kls };