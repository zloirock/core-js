import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a COMPUTED static-string key (`static ["N"]`) overrides an earlier plain field just like a plain
// one does at runtime, so the LAST-wins resolution must see through the computed key too
class Computed {
  static N = Array;
  static ["N"] = _Promise;
}
const allSettled = _Promise$allSettled;
export const viaComputedOverride = allSettled([]);