import _globalThis from "@core-js/pure/actual/global-this";
// a TERMINAL probe over a proven CALL root under a `delete`: the operator names a slot, so the run
// under it navigates like any other and folds onto the ROOT binding - the read twin keeps every hop,
// and a carrier at the root decides what RUNS, never what the delete lands on.
// own file: these rows delete the `window` SLOT, and a slot mutation deopts every read of that slot
// in the file it shares
const dhRoot = () => _globalThis;
let e = 0;
export const deletedTerminalProbe = delete _globalThis.window;
export const deletedTerminalProbePrefixed = delete (e++, _globalThis).window;
export { e };