import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
// an SE inside the host's own RHS folds too: the effect runs exactly once in both
// emitters (statement-lift vs in-place sequence is a print-only divergence)
let customW;
let c = 0;
c++;
({
  customW
} = _Map);
export const entries = _Object$entries;