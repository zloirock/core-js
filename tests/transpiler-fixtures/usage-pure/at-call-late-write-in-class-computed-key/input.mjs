// every computed member key is evaluated while the class is defined, before any static field value
// runs, so a write in a key placed BELOW such a field still reaches it. its position past the
// instance's temporal bound proves nothing and it folds; the plain write after the bound in the
// second row is the boundary - it stays dropped
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
class Probe {
  static read = early.first();
  [(early.items = 'string', 'later')]() {}
}
late.has();
late.entries = 42;
