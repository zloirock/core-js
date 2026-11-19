// A used pattern assignment returns the whole realm receiver.
let usedPrototype;
const kept = ({ self: { Map: { prototype: usedPrototype } } } = globalThis);
use(kept, usedPrototype);
