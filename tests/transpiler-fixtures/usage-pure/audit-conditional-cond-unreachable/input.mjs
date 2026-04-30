// statically-unreachable branch: `if (false)` body still walked by the visitor and the
// inner `Promise.resolve` polyfilled. plugin does not perform constant-folding; runtime
// reachability is the user's concern. dead-code elimination is downstream's job.
if (false) {
  Promise.resolve(arr.at(0));
}
