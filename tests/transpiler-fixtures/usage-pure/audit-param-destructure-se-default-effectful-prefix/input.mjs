// param destructure with side-effecting SE-prefix default: `({from} = (logCall(),
// Array)) => from(...)`. synth-swap's `replaceWith` mutates only the SE tail node, so
// the prefix expressions stay in place at runtime. caller's arg still wins (default
// fires only on undefined caller-arg) - the synth literal carries the polyfill for the
// no-arg / undefined-arg case
declare function logCall(): void;
function probe({ from } = (logCall(), Array)) {
  return from([1, 2]);
}
probe();
