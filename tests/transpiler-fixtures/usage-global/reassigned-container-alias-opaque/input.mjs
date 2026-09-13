// A third source the file cannot enumerate makes the aliased holder opaque.
// Replacing the alias does not hand String out: its namespace is not injected.
// The final slot read belongs to external; the earlier Number still needs its constructor.
let first = { x: Number };
let second = { x: String };
first = second;
first = external;
const { x: { raw } } = first;
