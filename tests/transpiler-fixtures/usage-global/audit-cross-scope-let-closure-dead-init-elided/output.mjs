import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// a `let` UNCONDITIONALLY reassigned before the capturing closure is even defined: the closure can
// never observe the init 'of' (it is overwritten on every path before `read` exists), so Array[K]
// dispatches Array.from alone - es.array.of is NOT injected. the reaching-definition analysis prunes
// the dead init across the closure boundary, while the cross-boundary reassignment recovery still
// surfaces 'from' for the unplugin adapter
let K = 'of';
K = 'from';
const read = () => Array[K]([1, 2, 3]);
read();