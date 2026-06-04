// usage-pure labeled FOR-OF loop whose iterable needs a `_ref` memo and whose body has a
// `continue <label>`: the label must stay on the loop, not move onto a memo block, or the continue
// is illegal (V8 rejects it; the oxc runner does not). regression lock
function f(cond) {
  outer: for (const x of [1, 2].flat()) {
    if (cond) continue outer;
  }
}
f;
