import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a `delete` over a navigation whose only `?.` reads off a base that THROWS when absent - a plain
// realm hop over a call yielding the environment probe - has no short-circuit to reproduce, so the
// run folds whole onto the ponyfill. a guard rendered there would test a value the source never
// tested and hand `delete` a conditional, which deletes nothing. two negatives pin the boundary: a
// call root with a proven-defined yield leaves the hop below the `?.` nullish rather than throwing,
// and a `?.` standing on the call value itself guards the probe directly - both keep their guard
// (one global per row: a row deleting a realm SLOT deopts that name for the whole file)
const dw = () => _globalThis.window;
const dh = () => _globalThis;
let key;
export const foldsUnderTail = delete _Promise.x;
export const foldsUnderKeyedTail = delete _Map[key];
export const foldsUnderStaticCall = delete _Array$of(5);
export const foldsThroughHopTail = delete _self.Set;
export const keptOverDefinedCallRoot = delete (null == dh().window ? void 0 : _WeakMap)?.x;
export const keptOverTheProbeCall = delete (null == dw() ? void 0 : _WeakSet)?.x;