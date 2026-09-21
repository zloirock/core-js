import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Sibling constructor slots in one local container each resolve their own static.
// Rewriting the first slot must preserve the second claim.
const w = {
  a: Array,
  b: _Promise
};
const {
  a: {
    from
  },
  b: {
    resolve
  }
} = {
  a: {
    from: _Array$from
  },
  b: {
    resolve: _Promise$resolve
  }
};
from([1]);
resolve(2);