// Static-only array patterns keep native getters and binding order.
// A later neighbour observes the static binding after its source slot has initialized.
let sign, other;
const source = { get other() { return typeof sign; } };
const rows = [Math, source];
([{ sign }, { other }] = rows);
const inspect = { get next() { return typeof of; } };
const values = [Array, inspect];
const [{ of }, { next }] = values;
use(sign, other, of, next);
