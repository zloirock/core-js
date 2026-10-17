// An array host can wrap a keyed array level with prototype navigation.
// Both methods read the captured prototype before the sibling write completes.
let at, flat, tail;
([{ w: [{ prototype: { at, flat } }] }, tail] = [{ w: [Array] }, 7]);
use(at, flat, tail);
