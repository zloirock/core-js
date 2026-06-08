import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// an IIFE-callee receiver `f()` whose factory `f` is reassigned (here the reassignment DOMINATES, so
// the init () => Object is dead): f() returns Array, so f().from dispatches Array.from (unpolyfilled on
// ie:11). the union recovery inlines each reachable `() => X` factory value and resolves its return, so
// es.array.from is injected rather than dropped on the dominating-reassign bail
let f = () => Object;
f = () => Array;
f().from([1, 2, 3]);