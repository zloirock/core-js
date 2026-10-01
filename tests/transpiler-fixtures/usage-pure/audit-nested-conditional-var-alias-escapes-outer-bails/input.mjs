// Both nested branches must run to initialize the hoisted realm alias.
// The read outside them cannot fold directly. Pure guards the live constructor,
// preserving the uninitialized-alias throw and the static on the initialized path.
function f() {
  if (a) {
    if (b) { var M = globalThis; }
  }
  M.Array.of([1]);
}
