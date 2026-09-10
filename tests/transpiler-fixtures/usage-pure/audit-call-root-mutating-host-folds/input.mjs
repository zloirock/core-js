// a MUTATING host consumes a call-rooted run without claiming it, and the shared plan has already
// answered that a member reads through the hops: the run lands exactly where its plain-read twin
// lands, on both legs. read through a positional gate written for the value-vs-root question an
// identifier claim answers, a write TARGET looked like "nothing navigates this" and the run stayed raw
const dh = () => globalThis;
export function writeThroughCallRoot() {
  dh().window.customQ = 1;
}
export function updateThroughCallRoot() {
  dh().self.window.customCount++;
}
export function readThroughCallRoot() {
  return dh().window.customQ;
}
