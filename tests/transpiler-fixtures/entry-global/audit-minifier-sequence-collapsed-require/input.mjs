// an entry require collapsed into a minifier sequence beside a destructure is still an entry once
// the split gives it a statement of its own - one that carries the operand's own position, which
// is what tells the entry detection a genuine statement from a synthesis it must leave alone; the
// require left inside a control-flow slot is not a top-level entry and stays, as it always did
const o = { x: 1 };
(eff(), ({ x } = o), require('core-js/actual/array/from'));
if (c) (eff2(), ({ x } = o), require('core-js/actual/array/of'));
