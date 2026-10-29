import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A claimed enum hop retains the stored surface and both prefix effects.
// Delete uses the same base as the dotted form after the store.
enum RealmHop {
  SELF = 'self'
}
const effects: string[] = [];
let held;
// @ts-expect-error the realm field stands for an arbitrary user property
export const removed = delete (effects.push('before'), held = (effects.push('inside'), globalThis.self))[RealmHop.SELF].marker;
export { held, effects };