// A write through the catch binding changes the original container.
// The old positional initializer cannot select a single receiver family.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  e[0] = "ab";
}
const [{
  at
}] = rows;
use(at);
