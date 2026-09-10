import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// a case TEST runs before the body of the clause the switch settles on, so a write there executes at
// a time its source position cannot rank: standing past the instance's temporal bound does not make
// it dead, and it folds into the field's type. the plain write after the bound in the second row is
// the boundary - it stays dropped
class Early {
  items = [1, 2, 3];
  first() {
    return this.items.at(0);
  }
}
class Late {
  entries = ['a', 'b'];
  has() {
    return this.entries.includes('a');
  }
}
const early = new Early();
const late = new Late();
switch (globalThis.k) {
  default:
    early.first();
    break;
  case (early.items = 'string', 2):
    break;
}
late.has();
late.entries = 42;