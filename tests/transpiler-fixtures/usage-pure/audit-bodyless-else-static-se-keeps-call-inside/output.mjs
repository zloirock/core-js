import _Array$of from "@core-js/pure/actual/array/of";
// `(`-leading polyfill replacement in an UNBRACED `else` body (the IfStatement.alternate slot,
// distinct from the consequent). same hazard as the `if` case: a prepended `;` would empty the
// `else` body and hoist the polyfilled call out of the conditional. distinct static (Array.of)
// from the `if` fixture. unplugin-only - babel's expression-statement codegen never strands it.
let cond = true;
function probe() {}
if (cond) probe();else (probe(), _Array$of)(1, 2);