// update on a global identifier (Map++) is user bug - assignment coerces to NaN and clobbers
// the global. plugin nevertheless injects the polyfill for the read side: without it, the
// global is undefined in IE 11 and the update ReferenceError's before semantics matter.
// gated behind `if (false)` so the fixture does not rely on runtime semantics of user bugs
if (false) {
  Map++;
  ++Promise;
  WeakMap--;
  --Set;
}
