import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// a realm run rooted in an inline-provable CALL answers cell for cell like its IDENTIFIER twin:
// the `?.` that decides whether a `delete` happens is asked of the whole deleted run and survives,
// a hop key BOUND to a constant string folds like its dotted spelling, and a run cloned into a
// lowered guard TEST folds where its landing is the run's own root - the test's own probe keeps
// its spelling, root and all, whether the callee yields through an expression or a block body
const dh = () => _globalThis;
const bk = 'window';
let w;
let v;
delete _self.window?.a.keptGuardSlot;
delete _globalThis.deadRootOptionalSlot;
delete _globalThis.boundKeyHopSlot;
export const boundHopFolds = _self.a?.readSlot;
export const guardTestFolds = null == (w = _globalThis.Array) ? void 0 : _Array$from([]);
export const blockBodyRootProbe = null == (v = null == function () {
  return _globalThis;
}().window ? void 0 : _Promise) ? void 0 : _Promise$resolve(1);
export const stored = [typeof w, typeof v];