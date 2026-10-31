import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// an escape through a computed key the claim folds takes the whole entry however the key folds - an effect ahead
// of the name, a const binding, a concat, a template - and whatever hands the value out: an export, a call, an
// alias. a folded read that stays home keeps the narrow entry
let k = 0;
const K = 'Set';
var ViaEffect = _Map;
var {
  [(k++, 'Map')]: _unused
} = _globalThis;
export default [ViaEffect];
const ViaBound = _Set;
use(ViaBound);
const ViaConcat = _WeakMap;
const ViaAlias = ViaConcat;
export { ViaAlias };
export const viaTemplate = [_Promise];
const Home = _WeakSet;
const {
  [(k++, 'WeakSet')]: _unused2
} = _globalThis;
export const home = new Home().has(viaTemplate);