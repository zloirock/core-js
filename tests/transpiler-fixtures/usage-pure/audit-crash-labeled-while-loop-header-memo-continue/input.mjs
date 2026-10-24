// usage-pure labeled WHILE loop whose header needs a `_ref` memo and whose body has a
// `continue <label>`: same broadened shape as the braced-for case. the label must stay on the
// loop or the continue is illegal (V8 rejects it; the oxc runner does not). regression lock
function g(cond) {
  loop: while ([4, 5].flat()[0]) {
    if (cond) continue loop;
    break;
  }
}
g;
