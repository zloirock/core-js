import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// An assignment in the receiver runs before a later computed-key effect.
// The stored value and the static polyfill survive the receiver rewrite.
const log = [];
let r1;
(r1 = _globalThis)[_pushMaybeArray(log).call(log, typeof r1), "Array"];
const o1 = _Array$of;
use(o1, r1);
let r2;
const [{
  of: o2
}] = [((r2 = _globalThis)[_pushMaybeArray(log).call(log, typeof r2), "Array"], {
  of: _Array$of
})];
use(o2, r2);
let r3, o3;
(r3 = _globalThis)[_pushMaybeArray(log).call(log, typeof r3), "Array"];
o3 = _Array$of;
use(o3, r3);
let r4;
(_pushMaybeArray(log).call(log, "s"), r4 = _globalThis)[_pushMaybeArray(log).call(log, typeof r4), "Array"];
const o4 = _Array$of;
use(o4, r4);
let r5;
_globalThis[_pushMaybeArray(log).call(log, "k"), r5 = 1, "Array"];
const o5 = _Array$of;
use(o5, r5, log);