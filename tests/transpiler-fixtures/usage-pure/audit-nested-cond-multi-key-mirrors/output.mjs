import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a nested ternary mirror with MULTIPLE inner statics: each resolvable static of the proxy
// branch (`from`, `of`) is mirrored into the synth literal, the user-object branch kept verbatim
const userObj = {
  Array: {
    from: () => "uf",
    of: () => "uo"
  }
};
const {
  Array: {
    from,
    of
  }
} = c ? {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
} : userObj;
from([1]);
of(2);