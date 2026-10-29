import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _self from "@core-js/pure/actual/self";
// A claimed enum hop retains the stored surface and both prefix effects.
// Delete uses the same base as the dotted form after the store.
enum RealmHop {
  SELF = 'self'
}
const effects: string[] = [];
let held;
// @ts-expect-error the realm field stands for an arbitrary user property
export const removed = delete (_pushMaybeArray(effects).call(effects, 'before'), held = (_pushMaybeArray(effects).call(effects, 'inside'), _self), _self).marker;
export { held, effects };