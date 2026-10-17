// a COMPUTED static-string key (`static ["N"]`) overrides an earlier plain field just like a plain
// one does at runtime, so the LAST-wins resolution must see through the computed key too
class Computed {
  static N = Array;
  static ["N"] = Promise;
}
const { N: { allSettled } } = Computed;
export const viaComputedOverride = allSettled([]);
