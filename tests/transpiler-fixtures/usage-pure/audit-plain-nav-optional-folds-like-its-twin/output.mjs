import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// a `?.` reading a value the collapse assumption DEFINES asks for no branch: a deeper unbacked hop
// is a realm self-reference, so the nav folds exactly like its `?.`-free twin and no probe guard is
// built. only a `?.` whose own object IS the environment probe - the FIRST hop off the root - keeps
// one. a sequence-rooted nav proves its alias through the write beside it, so the ctor above it
// resolves instead of reading raw off a ponyfill
let g, v, key;
export const backedLeafFolds = _Promise.noSuchStatic;
export const deeperHopFolds = _globalThis.customKey;
export const firstHopKeepsTheProbe = null == _globalThis.window ? void 0 : _Promise.noSuchStatic;
export const seqRootProvesItsAlias = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? void 0 : _Promise.noSuchStatic;
export const seqRootDelete = delete (g = _globalThis, v = null == g.window ? void 0 : _self, _Promise)[key];
export { g, v };