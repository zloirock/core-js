import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a `?.` reading a value the collapse assumption DEFINES asks for no branch: a deeper unbacked hop is
// a realm self-reference, so the nav folds like its `?.`-free twin. only a `?.` whose own object IS the
// environment probe - the FIRST hop off the root - keeps a guard. a sequence-rooted nav proves its alias
// through the write beside it, so the ctor above it resolves; the delete row's ctor is its own, since a
// deleted slot deoptimizes its name for the whole file
let g, v, key;
export const backedLeafFolds = _Map.noSuchStatic;
export const deeperHopFolds = _self.customKey;
export const firstHopKeepsTheProbe = null == _globalThis.window ? void 0 : _Set.noSuchStatic;
export const seqRootProvesItsAlias = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? void 0 : _WeakMap.noSuchStatic;
// ... and under `delete` the `?.` ABOVE that sequence decides whether the delete happens: it becomes
// the guard's test, and the delete rides the alternate
export const seqRootDelete = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? true : delete _Promise[key];
export { g, v };