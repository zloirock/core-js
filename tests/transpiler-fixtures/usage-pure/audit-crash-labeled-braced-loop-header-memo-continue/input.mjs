// usage-pure labeled BRACED loop whose header needs a `_ref` memo and whose body has a
// `continue <label>`: broadens the bodyless case - even a braced loop body must keep its label on
// the loop. wrapping the loop in a memo block makes the continue illegal (V8 rejects it; the oxc
// runner does not). hoist the memo before the labeled loop instead. regression lock
function f(cond) {
  outer: for (let i = 0; [2, 3].includes(i); i++) {
    if (cond) continue outer;
  }
}
f;
