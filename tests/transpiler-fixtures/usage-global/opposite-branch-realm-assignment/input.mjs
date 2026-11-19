// The realm write cannot reach the sibling branch in the same invocation.
// Keep the native read and its TypeError without injecting Array statics.
function read(flag) {
  let held;
  if (flag) held = globalThis;
  else held.Array.of(7);
}
