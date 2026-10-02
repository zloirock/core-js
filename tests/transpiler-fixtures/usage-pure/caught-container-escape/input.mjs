// A catch binding hands the thrown container out when it reaches an unknown consumer.
// Positional reads keep generic dispatch.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  mutate(e);
}
const [{
  at
}] = rows;
use(at);
