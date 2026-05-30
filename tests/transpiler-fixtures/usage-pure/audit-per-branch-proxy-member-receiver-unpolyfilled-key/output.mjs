import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// per-branch synth-swap where one branch is a proxy-global member (`globalThis.Array`) carrying
// a polyfilled key (`from`) and an unpolyfilled key (`other`). the synth swap owns the receiver
// chain, so the unpolyfilled key's member-access fallback must substitute the proxy-global root
// to its polyfill - a bare `globalThis` would ReferenceError on engines without it
const {
  from,
  other
} = cond ? {
  from: _Array$from,
  other: _globalThis.Array.other
} : _Set;
from([1]);