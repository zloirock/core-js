import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref, _ref2, _ref3;
// a NESTED proxy flatten that is PARTIALLY consumed: `Array.from` is extracted to a binding, but the
// sibling `other` survives inside the rebuilt `Array: { ... }` text. its default carries polyfillable
// content (an instance `.at` call, a static `Promise.any` call) that the natural visitor must still
// rewrite - foldNestedPattern must register residual targets for the surviving inner children so the
// usage-pure polyfill-always-wins contract holds and no native API leaks to IE11. distinct methods
// (.at instance, Promise.any static) show each survivor's content is independently re-anchored. the
// `Object` line carries TWO survivors in one nested prop, exercising the running dst-offset across
// multiple rebuilt entries (the second survivor's residual target must clear the first's text length)
const from = _Array$from;
const {
  Array: {
    withAt = _atMaybeArray(_ref = [1]).call(_ref, 0)
  }
} = _globalThis;
const resolve = _Promise$resolve;
const {
  Promise: {
    withAny = _Promise$any([2])
  }
} = _globalThis;
const fromEntries = _Object$fromEntries;
const {
  Object: {
    twoA = _atMaybeArray(_ref2 = [3]).call(_ref2, 0),
    twoB = _flatMaybeArray(_ref3 = [4]).call(_ref3)
  }
} = _globalThis;
from([5]);
resolve(6);
fromEntries([]);
withAt;
withAny;
twoA;
twoB;