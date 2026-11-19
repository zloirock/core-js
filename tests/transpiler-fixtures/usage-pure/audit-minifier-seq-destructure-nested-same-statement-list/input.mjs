// two minifier sequence-destructures nested in the SAME statement list: the outer sequence ends in a
// destructure whose MIDDLE operand is itself a sequence-destructure. splitting the outer once leaves
// the middle product sequence-wrapped at the same list level, and a single per-list pass drops the
// middle's import and reads the native static (undefined on ie11). the split must loop to a fixpoint
// over the live body. exercised at EVERY host: the Program body, a function body, a switch-case consequent
(eff1(), (eff2(), ({ from } = Array)), ({ entries } = Object));
function f() {
  (g1(), (g2(), ({ of } = Array)), ({ values } = Object));
}
switch (x) {
  case 1:
    (h1(), (h2(), ({ fromEntries } = Object)), ({ assign } = Object));
}
