import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// An earlier static claim must not erase the surviving function-name read.
// Both leaves read the same realm constructor.
const {
  Array: {
    from,
    name
  }
} = {
  Array: {
    from: _Array$from,
    name: _nameMaybeFunction(_globalThis.Array)
  }
};
use(from, name);