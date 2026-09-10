import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// a case TEST runs before the body of the clause the switch settles on, so a write there executes at
// a time its source position cannot rank: standing past the instance's temporal bound does not make
// it dead, and it folds into the field's type. the plain write after the bound in the second row is
// the boundary - it stays dropped
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
switch (_globalThis.k) {
  default:
    early.first();
    break;
  case (early.items = 'string', 2):
    break;
}
late.has();
late.entries = 42;