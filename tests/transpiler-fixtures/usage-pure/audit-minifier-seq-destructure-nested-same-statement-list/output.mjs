import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
// two minifier sequence-destructures nested in the SAME statement list: the outer sequence ends in a
// destructure whose MIDDLE operand is itself a sequence-destructure. splitting the outer once leaves
// the middle product sequence-wrapped at the same list level, and a single per-list pass drops the
// middle's import and reads the native static (undefined on ie11). the split must loop to a fixpoint
// over the live body. exercised at EVERY host: the Program body, a function body, a switch-case consequent
eff1();
eff2();
from = _Array$from;
entries = _Object$entries;
function f() {
  g1();
  g2();
  of = _Array$of;
  values = _Object$values;
}
switch (x) {
  case 1:
    h1();
    h2();
    fromEntries = _Object$fromEntries;
    assign = _Object$assign;
}