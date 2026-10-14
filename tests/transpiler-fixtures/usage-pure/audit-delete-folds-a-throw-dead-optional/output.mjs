import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A `delete` whose only `?.` reads off a hop that throws when the probe is absent (a realm hop over a
// call yielding `window`) has no short-circuit to keep, so the run folds whole onto the ponyfill. Two
// negatives keep their guard: a call yielding the realm, whose `window` hop may be nullish, and a `?.`
// on the call value, which tests the probe directly. One global per row: deleting a realm slot holds
// that name native for the whole file.
const dw = () => _globalThis.window;
const dh = () => _globalThis;
let key;
export const foldsUnderTail = delete _Promise.x;
export const foldsUnderKeyedTail = delete _Map[key];
export const foldsUnderStaticCall = delete _Array$of(5);
export const foldsThroughHopTail = delete _self.Set;
export const keptOverDefinedCallRoot = null == dh().window ? true : delete _WeakMap.x;
export const keptOverTheProbeCall = null == dw() ? true : delete _WeakSet.x;