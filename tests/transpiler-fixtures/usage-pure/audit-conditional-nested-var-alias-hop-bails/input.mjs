// A conditional var initializer does not prove the alias is the realm on every path.
// A runtime identity guard may select the backed self entry when that initializer ran;
// otherwise it must keep g.self, including the TypeError from an unassigned g.
// The surrounding sequence and later instance read retain their evaluation positions.
function f(c) {
  if (c) { var g = globalThis; }
  return (0, g.self).Array.prototype.findLastIndex;
}
export { f };
