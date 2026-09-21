import _Array$from from "@core-js/pure/actual/array/from";
import _Object$values from "@core-js/pure/actual/object/values";
// A static call inside a sibling function keeps its own polyfill beside the nested static.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  kls = (() => {
    return _Object$values({
      a: 1
    });
  })();
export { from, kls };