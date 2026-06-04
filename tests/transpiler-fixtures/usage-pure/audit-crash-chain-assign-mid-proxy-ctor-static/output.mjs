import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// usage-pure chain-assignment proxy-global root (`(a = globalThis).Promise.resolve`) whose
// mid-chain key is itself a polyfillable constructor (Promise): the constructor member must be
// recognised as proxy-global-rooted and subsumed, or unplugin double-detects it and the inner
// rewrite overlaps the static replacement, crashing the compose. regression lock
let a;
const r = (a = _globalThis, _Promise$resolve)(1);
[r, a];