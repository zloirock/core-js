import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// a proxy-global HOP KEY carrying a side effect, read under a LIVE `?.`: the guard test is the kept
// source of the hop that owns the key, so it already evaluates that effect - re-emitting it ahead of
// the alternate would run it twice where native runs it once. a key ABOVE the guarded hop is the
// boundary: the test never reaches it, so that one DOES belong to the alternate
let log = [];
function eff(t) { _pushMaybeArray(log).call(log, t); return t; }
const plainRoot = null == _globalThis[(eff('a'), 'window')] ? void 0 : _self.Array;
const g = _globalThis;
const aliasRoot = null == g[(eff('b'), 'window')] ? void 0 : _Map;
const aboveTheGuard = null == _globalThis.window ? void 0 : (eff('c'), _Set);
const bothSides = null == _globalThis[(eff('d'), 'window')] ? void 0 : (eff('e'), _Promise);
export { log, plainRoot, aliasRoot, aboveTheGuard, bothSides };