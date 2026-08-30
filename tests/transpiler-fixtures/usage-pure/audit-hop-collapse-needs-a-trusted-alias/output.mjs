import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// three IDENTICAL reads of one navigation must render alike. the alias at the chain root is written by
// each of them, so no single write holds at any of the reads - and a hop dropped on the weaker "which
// global does this name refer to" answer moved with an unrelated EARLIER statement's write: the first
// read kept the hop its twins below dropped, purely because it had no earlier write to point at.
// the SINGLE-write twin below is the negative: there the ordinary resolution stands and the hop folds
let v, g, out, out2, out3;
out = (g = _globalThis, v = null == g.window ? void 0 : _self)?.window.noSuchStatic;
out2 = (g = _globalThis, v = null == g.window ? void 0 : _self)?.window.noSuchStatic;
out3 = (g = _globalThis, v = null == g.window ? void 0 : _self)?.window.noSuchStatic;
let s1;
export const singleWrite = (s1 = _globalThis, _globalThis).noSuchStatic;
export const read = [out, out2, out3];