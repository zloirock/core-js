// the use sits BEFORE the declarator inside the loop body. the loop-reinit declarator-self violation
// is ignored (so the loop alone wouldn't bail), but on the FIRST iteration M is still `undefined` at
// the use, so the source-order leg bails - resolving `M.Object.entries` would mask that native throw.
// the read of `M.Object` stays, and the static rides an identity guard over what it read
function f() {
  while (c) {
    M.Object.entries({ a: 1 });
    var M = globalThis;
  }
}
