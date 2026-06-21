// an inner default whose receiver is a LOGICAL fallback (`= Array || Set`) is the value-bearing host:
// every reachable branch is a receiver, so the `||` selects Array when the slot is undefined and `from`
// resolves to Array.from. a bare empty fallback (`= {}`) stays transparent - only an all-receiver
// fallback makes the inner default the host instead of see-through
function g([{ from } = Array || Set]) { return from; }
export const r = g([]);
