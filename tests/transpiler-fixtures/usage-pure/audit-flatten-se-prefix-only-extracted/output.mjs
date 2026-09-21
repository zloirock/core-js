import _Array$from from "@core-js/pure/actual/array/from";
// An unrelated sibling sequence runs exactly once beside a nested static declarator.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  y = (sideEffect(), 1);
export { from, y };