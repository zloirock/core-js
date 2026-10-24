// The run's own ROOT is a landing like any hop: a backed name spelled BARE is the deepest thing pure can back, so the run lands
// there and every rule the landing carries reaches it - the probe a plain member READS THROUGH folds onto the binding, and the
// `?.` standing directly on that binding is dead text.
let a, b, c, d, e, f, g, h;
// NEGATIVE: a shadowing binding holds the user's own object, and no realm landing may touch it
export function shadowed(self) {
  return (h = self.window.Number)?.isInteger(1);
}
export { h };
