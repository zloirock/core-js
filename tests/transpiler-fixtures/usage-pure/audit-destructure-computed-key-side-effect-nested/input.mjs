// A nested computed static key evaluates once after its receiver is captured.
// The key precedes initialization of its source binding, and the pure method wins.
// The following instance call retains its own polyfill.
const { x: { [(effectful(), "from")]: f } } = { x: Array };
const doubled = [1, [2]].flat();
