// A stored all-realm selection retains its write and uses the shared leaf-default route.
// A falsy left operand still throws when the nested pattern reads its missing receiver.
let stored;
const { Array: { from } } = (stored = flag && globalThis);
use(from, stored);
