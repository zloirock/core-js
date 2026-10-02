import _at from "@core-js/pure/actual/instance/at";
// A catch binding hands the thrown container out when it reaches an unknown consumer.
// Positional reads keep generic dispatch.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  mutate(e);
}
const [_ref] = rows;
const at = _at(_ref);
use(at);