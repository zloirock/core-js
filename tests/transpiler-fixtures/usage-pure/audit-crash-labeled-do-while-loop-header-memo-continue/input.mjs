// usage-pure labeled DO-WHILE loop whose footer test needs a `_ref` memo and whose body has a
// `continue <label>`: same broadened shape. the label must stay on the loop or the continue is
// illegal (V8 rejects it; the oxc runner does not). regression lock
function h(cond) {
  dl: do {
    if (cond) continue dl;
  } while ([6].at(0));
}
h;
