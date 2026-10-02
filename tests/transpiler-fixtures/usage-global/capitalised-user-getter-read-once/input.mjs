// A user class getter is evaluated once where a nested pattern reads its constructor prototype.
// Its proven array prototype selects the array helpers. The built-in sibling keeps its own claims.
class KE { static get A() { log(); return Array; } }
let m, fl;
({ A: { prototype: { at: m, flat: fl } } } = KE);
const { Array: { prototype: { includes: inc } } } = globalThis;
use(m, fl, inc);
