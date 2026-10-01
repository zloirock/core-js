// three IDENTICAL reads of one navigation must render alike. the alias at the chain root is written by
// each of them, so no single write holds at any of the reads - and a hop dropped on the weaker "which
// global does this name refer to" answer moved with an unrelated EARLIER statement's write: the first
// read kept the hop its twins below dropped, purely because it had no earlier write to point at.
// the SINGLE-write twin below is the negative: there the ordinary resolution stands and the hop folds
let v, g, out, out2, out3;
out = (g = globalThis, v = g.window?.self)?.window.noSuchStatic;
out2 = (g = globalThis, v = g.window?.self)?.window.noSuchStatic;
out3 = (g = globalThis, v = g.window?.self)?.window.noSuchStatic;
let s1;
export const singleWrite = (s1 = globalThis).self.noSuchStatic;
export const read = [out, out2, out3];
