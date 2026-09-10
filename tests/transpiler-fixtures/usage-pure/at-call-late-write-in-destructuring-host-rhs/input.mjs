// a destructuring host evaluates its right-hand side before any slot of the pattern, so a write
// there runs before a default that reads the field, whatever the two positions say. it folds
// despite standing past the instance's temporal bound; the plain write in the second row is the
// boundary - it stays dropped
class Early {
  items = [1, 2, 3];
  first() { return this.items.at(0); }
}
class Late {
  entries = ['a', 'b'];
  has() { return this.entries.includes('a'); }
}
const early = new Early();
const late = new Late();
const { a = early.first() } = (early.items = 'string', {});
globalThis.sink = a;
late.has();
late.entries = 42;
