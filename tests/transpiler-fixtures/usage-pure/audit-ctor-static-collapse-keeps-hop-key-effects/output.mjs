import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
// Constructor and static leaf keys retain their effect channels.
// An effectful realm-hop key instead keeps its source read.
let u;
let g = 0;
let e = 0;
let c = 0;
export const belowLeaf = null == (u = _globalThis.window) ? void 0 : _toFixedMaybeNumber((g++, _Number$MAX_SAFE_INTEGER)).call(_Number$MAX_SAFE_INTEGER, 2);
export const atLeaf = null == (u = _globalThis.window) ? void 0 : _toFixedMaybeNumber((g++, _Number$MAX_SAFE_INTEGER)).call(_Number$MAX_SAFE_INTEGER, 2);
export const seTailHopKey = (e++, _globalThis)[c++, 'self'].Map;
export const seTailPlain = (e++, _Map);