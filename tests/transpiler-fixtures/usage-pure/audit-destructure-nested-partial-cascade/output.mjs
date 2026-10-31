import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// A nested static and a constructor sibling both receive pure values through proxy hops.
const {
  self: {
    Array: {
      from
    },
    Set
  }
} = {
  self: {
    Array: {
      from: _Array$from
    },
    Set: _Set
  }
};
from(xs);
new Set();