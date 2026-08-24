// a folded computed KEY with effects re-roots to the kept ROOT binding only when NAVIGATED
// above (`(eff(), _globalThis).Array`); a TERMINAL fold keeps its OWN pure - the source
// spells a self-hop claim and babel injects `self`, so re-rooting swapped the IMPORT out
// from under the claim (the runtime value is the same global object either way - the
// divergence is the claim resolution, held here by the babel-parity compare)
let e = 0;
const terminal = globalThis[(e++, "se") + "lf"];
use(terminal, e);
const navigated = globalThis[(e++, "se") + "lf"].Array;
use(navigated, e);
