// two minifier sequence-destructures nested within the SAME statement list: the outer sequence ends
// in a destructure, and its MIDDLE operand is itself a sequence-destructure. splitting the outer once
// leaves the middle product sequence-wrapped at the same list level - the post-split traverse only
// re-reaches NEW brace hosts, so a single per-list pass drops the middle's `import` and reads the
// native static (undefined on ie11). the split must loop to a fixpoint over the live body (matching
// unplugin) so the middle product is re-split. exercised at EVERY statement-list host the bug touches:
// the Program body (direct splitInBody), a function body + a switch-case consequent (the traverse path)
(eff1(), (eff2(), ({ from } = Array)), ({ entries } = Object));
function f() {
  (g1(), (g2(), ({ of } = Array)), ({ values } = Object));
}
switch (x) {
  case 1:
    (h1(), (h2(), ({ fromEntries } = Object)), ({ assign } = Object));
}
