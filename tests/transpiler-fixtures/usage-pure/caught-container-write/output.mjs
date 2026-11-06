import _at from "@core-js/pure/actual/instance/at";
// A write through the catch binding changes the original container.
// The old positional initializer cannot select a single receiver family.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  e[0] = "ab";
}
const [_ref] = rows;
const at = _at(_ref);
use(at);