import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Two nested static declarators in one declaration independently receive pure values.
// Neither rewrite consumes the sibling claim.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  {
    Object: {
      fromEntries
    }
  } = {
    Object: {
      fromEntries: _Object$fromEntries
    }
  };
export { from, fromEntries };