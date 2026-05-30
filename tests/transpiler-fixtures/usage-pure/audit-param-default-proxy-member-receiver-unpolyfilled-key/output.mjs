import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// parameter destructure whose default is a proxy-global member (`globalThis.Array`) with one
// polyfilled key (`from`) and one unpolyfilled key (`other`). the synth swap owns the receiver
// chain, so the unpolyfilled key's member-access fallback must substitute the proxy-global root
// to its polyfill - otherwise bare `globalThis` leaks and ReferenceErrors on engines without it
function f({
  from,
  other
} = {
  from: _Array$from,
  other: _globalThis.Array.other
}) {
  return [from, other];
}
f();