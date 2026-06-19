import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// dropping the dead receiver tail must not over-suppress the kept SE prefix: a side-effecting
// prefix carrying its own polyfillable stays visible and is polyfilled, while the `globalThis`
// receiver is still dropped.
function eff() {}
_Promise$resolve(eff());
const Map = _Map;
export const m = new Map();