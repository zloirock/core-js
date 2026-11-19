import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// destructure init with `...someObj` spread: Proxy traps on `someObj` may have side
// effects, so the init can't be elided even when no properties match a polyfill
const {
  from
} = {
  ...someObj,
  from: _Array$from
};
_globalThis.__r = from([1, 2]);