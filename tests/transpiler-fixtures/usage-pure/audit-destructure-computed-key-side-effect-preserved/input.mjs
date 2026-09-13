// A computed static key captures Array before evaluating effectful(), then binds the always-defined
// pure Array.from value. The effect runs once before the following flat expression.
const { [(effectful(), "from")]: f } = Array;
const doubled = [1, [2]].flat();
