import _Array$from from "@core-js/pure/actual/array/from";
// an inner pattern default (`from = []`) on the mirrored leaf: the synth binds the polyfill
// directly (the user default is dead under the always-defined polyfill), user-object branch kept
const userObj = {
  Array: {}
};
const {
  Array: {
    from = []
  }
} = c ? {
  Array: {
    from: _Array$from
  }
} : userObj;
from([1]);