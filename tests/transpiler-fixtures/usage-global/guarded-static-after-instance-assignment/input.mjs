// A guarded static follows the earlier instance write in a discarded assignment.
// The native sibling retains its source slot; user getters read in property order.
// Global mode keeps the source pattern and supplies its imports.
let M = Map;
if (flag) M = supplied;
let nm, method, other;
({ name: nm, groupBy: method, at: other } = M);
use(nm, method, other);
