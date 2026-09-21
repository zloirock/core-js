import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref, _ref2, _ref3;
// Residual defaults beside nested statics keep their own polyfill rewrites.
// Every surviving sibling remains live, including multiple defaults under one hop.
const {
  Array: {
    from,
    withAt = _atMaybeArray(_ref = [1]).call(_ref, 0)
  }
} = {
  Array: {
    from: _Array$from,
    withAt: _globalThis.Array.withAt
  }
};
const {
  Promise: {
    resolve,
    withAny = _Promise$any([2])
  }
} = {
  Promise: {
    resolve: _Promise$resolve,
    withAny: _Promise.withAny
  }
};
const {
  Object: {
    fromEntries,
    twoA = _atMaybeArray(_ref2 = [3]).call(_ref2, 0),
    twoB = _flatMaybeArray(_ref3 = [4]).call(_ref3)
  }
} = {
  Object: {
    fromEntries: _Object$fromEntries,
    twoA: _globalThis.Object.twoA,
    twoB: _globalThis.Object.twoB
  }
};
from([5]);
resolve(6);
fromEntries([]);
withAt;
withAny;
twoA;
twoB;