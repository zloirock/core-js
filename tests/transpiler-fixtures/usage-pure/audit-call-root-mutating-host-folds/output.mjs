import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a MUTATING host consumes a call-rooted run without claiming it, and the shared plan has already
// answered that a member reads through the hops: the run lands exactly where its plain-read twin
// lands, on both legs. read through a positional gate written for the value-vs-root question an
// identifier claim answers, a write TARGET looked like "nothing navigates this" and the run stayed raw
const dh = () => _globalThis;
export function writeThroughCallRoot() {
  _globalThis.customQ = 1;
}
export function updateThroughCallRoot() {
  _self.customCount++;
}
export function readThroughCallRoot() {
  return _globalThis.customQ;
}