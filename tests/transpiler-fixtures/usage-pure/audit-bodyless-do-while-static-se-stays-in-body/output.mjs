import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// `(`-leading polyfill replacement in an UNBRACED `do` body: a prepended `;` empties the body so
// the parser then expects `while` at the call site and reparses FATALLY (`do ; (...) while` is a
// syntax error). the call must stay verbatim inside the `do` body. distinct static from the `if`
// fixture so the injected import set proves this body was reached. unplugin-only.
let cond = false;
function probe() {}
do (probe(), _Object$fromEntries)([['a', 1]]); while (cond);