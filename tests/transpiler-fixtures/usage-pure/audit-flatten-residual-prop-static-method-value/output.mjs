import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// proxy-global nested flatten with a residual sibling whose default holds a STATIC-method
// call. the flatten extracts `from = _Array$from`; the residual `names` default
// `Object.getOwnPropertyNames({})` must still resolve to `_Object$getOwnPropertyNames`
// in place (a static call has no receiver memo, unlike the instance-call shape)
var from = _Array$from;
var {
  names = _Object$getOwnPropertyNames({})
} = _globalThis;
from([4]);
names;