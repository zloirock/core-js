import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// a destructuring host evaluates its right-hand side before any slot of the pattern, so a write
// there runs before a default that reads the field, whatever the two positions say. it folds
// despite standing past the instance's temporal bound; the plain write in the second row is the
// boundary - it stays dropped
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
const {
  a = early.first()
} = (early.items = 'string', {});
_globalThis.sink = a;
late.has();
late.entries = 42;