// combined chain with an optional OUTER member (`?.at`) and a non-optional hop (`.map(...)`)
// between the inner `flat?.()` and the outer call: the hop must be threaded into the null-checked
// receiver, not discarded - dropping `.map` corrupts the value and loses its polyfill import
const arr = [[1]];
arr.flat?.().map(x => x * 2)?.at(0);
