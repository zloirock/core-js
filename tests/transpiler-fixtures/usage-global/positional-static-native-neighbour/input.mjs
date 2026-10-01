// A static binding precedes a neighbouring native getter, including through a stored array.
// Capturing both positions preserves the getter's observation of the preceding binding.
let sign, other;
const source = { get other() { return typeof sign; } };
const rows = [Math, source];
([{ sign }, { other }] = rows);
const inspect = { get next() { return typeof of; } };
const values = [Array, inspect];
const [{ of }, { next }] = values;
use(sign, other, of, next);
