import _at from "@core-js/pure/actual/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// statically-unreachable branch: `if (false)` body still walked by the visitor and the
// inner `Promise.resolve` polyfilled. plugin does not perform constant-folding; runtime
// reachability is the user's concern. dead-code elimination is downstream's job.
if (false) {
  _Promise$resolve(_at(arr).call(arr, 0));
}