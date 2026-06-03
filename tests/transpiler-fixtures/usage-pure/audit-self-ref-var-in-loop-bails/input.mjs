// a self-ref shim `var Map = Map` inside a loop body: `var` hoists the declaration, so the RHS reads
// the LOCAL binding (undefined on iteration 1), not the global - resolving it to the global would
// mask the native throw. babel flags the loop re-init via its native binding's constantViolations;
// estree-toolkit's binding doesn't, so the self-ref guard checks the declarator's loop nesting to
// bail on both. contrast a fn-top `var Map = Map` (the real shim), which still resolves
function f() {
  while (c) {
    var Map = Map;
    new Map();
  }
}
