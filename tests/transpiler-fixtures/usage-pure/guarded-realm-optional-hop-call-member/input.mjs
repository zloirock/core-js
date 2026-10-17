// A CALLEE under that hop rides the same guard: the call moves INTO the branches, so `this` is the
// branch's own value and its arguments still run ahead of the throw a non-callable method owes,
// while the short-circuit is spelled once, over the whole render, off the hop's own base.
export function callMember(flag) {
  if (flag) { var realm = globalThis; }
  return realm?.Array.of(7);
}
