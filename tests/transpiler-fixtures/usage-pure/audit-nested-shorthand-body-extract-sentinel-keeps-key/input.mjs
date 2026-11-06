// Capture the literal receiver once, select the pure at method from its m value, then evaluate the
// computed sibling key. Both source bindings and their property order are preserved.
function key() { return 'k'; }

const { m: { at }, [key()]: picked } = { m: [1], k: 2 };
at();
export const out = picked;
