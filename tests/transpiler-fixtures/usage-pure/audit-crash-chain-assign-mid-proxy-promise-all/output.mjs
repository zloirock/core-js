import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$all from "@core-js/pure/actual/promise/all";
// usage-pure chain-assignment proxy-global root with a polyfillable mid-chain constructor and a
// different static (`(a = globalThis).Promise.all`): the constructor member must be recognised as
// proxy-global-rooted and subsumed, or unplugin double-detects it and crashes. regression lock
let a;
const r = (a = _globalThis, _Promise$all)([]);
[r, a];