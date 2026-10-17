// A pre-polyfilled static extraction and its residual rest pattern stay unchanged on a second pass.
// Keep the serving import beside its sentinel: together they identify the earlier claim.
import _Promise$any from "@core-js/pure/actual/promise/any";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const any = _Promise$any;
const {
  Promise: {
    any: _unused2,
    prototype: {
      catch: rescue
    },
    ...pooled
  } = _Set
} = _self;
export { any, rescue, pooled };