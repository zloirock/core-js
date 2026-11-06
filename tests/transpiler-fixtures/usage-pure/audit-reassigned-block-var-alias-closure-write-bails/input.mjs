// A nested closure can overwrite the hoisted realm alias without rebinding it.
// Pure cannot fold the receiver: its live constructor read needs an identity guard,
// preserving both the realm static and the supplied value after a closure write.
function f() {
  if (c) { var M = globalThis; }
  function g() { M = somethingElse; }
  M.Array.from([1]);
}
