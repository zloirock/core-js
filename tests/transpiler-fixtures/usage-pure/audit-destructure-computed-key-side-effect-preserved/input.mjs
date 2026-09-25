// A computed static key off a proven constructor evaluates effectful(), then binds the always-defined
// pure Array.from value - nothing captures the receiver. The effect runs once before the following
// flat expression.
const { [(effectful(), "from")]: f } = Array;
const doubled = [1, [2]].flat();
