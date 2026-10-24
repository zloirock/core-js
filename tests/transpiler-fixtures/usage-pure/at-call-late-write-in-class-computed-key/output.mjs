import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// every computed member key is evaluated while the class is defined, before any static field value
// runs, so a write in a key placed BELOW such a field still reaches it. its position past the
// instance's temporal bound proves nothing and it folds; the plain write after the bound in the
// second row is the boundary - it stays dropped
class Early {
  items = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class Late {
  entries = ['a', 'b'];
  has() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.entries).call(_ref2, 'a');
  }
}
const early = new Early();
const late = new Late();
class Probe {
  static read = early.first();
  [(early.items = 'string', 'later')]() {}
}
late.has();
late.entries = 42;