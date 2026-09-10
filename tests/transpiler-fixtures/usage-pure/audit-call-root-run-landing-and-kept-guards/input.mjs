// a realm run rooted in an inline-provable CALL answers cell for cell like its IDENTIFIER twin:
// the `?.` that decides whether a `delete` happens is asked of the whole deleted run and survives,
// a hop key BOUND to a constant string folds like its dotted spelling, and a run cloned into a
// lowered guard TEST folds where its landing is the run's own root - the test's own probe keeps
// its spelling, root and all, whether the callee yields through an expression or a block body
const dh = () => globalThis;
const bk = 'window';
let w;
let v;
delete dh().self.window?.a.keptGuardSlot;
delete dh()?.window.self.deadRootOptionalSlot;
delete dh().self[bk].boundKeyHopSlot;
export const boundHopFolds = dh().self[bk].a?.readSlot;
export const guardTestFolds = (w = dh().window.Array)?.from([]);
export const blockBodyRootProbe = (v = (function () { return globalThis; })().window.self.Promise)?.resolve(1);
export const stored = [typeof w, typeof v];
