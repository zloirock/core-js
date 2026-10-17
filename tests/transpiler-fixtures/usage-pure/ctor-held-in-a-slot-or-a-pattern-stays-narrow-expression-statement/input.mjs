// A constructor a value position STORES rather than hands out: a write puts it inside the receiver, and an argument landing in a
// destructuring parameter of a callee spelled inline binds the slots the pattern names.
const held = { k: Object };
held.k = Map;
use(new held.k());
