import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A sibling function default keeps its own caller-correct mirror beside the nested static.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  helper = function ({
    of
  } = {
    of: _Array$of
  }) {
    return of(1, 2);
  };
export { from, helper };