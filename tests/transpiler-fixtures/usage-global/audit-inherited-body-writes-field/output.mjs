import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// global flavor: an inherited body that may write the subclass's slot leaves the field's family
// unknown, so every family it could belong to is covered. a BUILT-IN base writes no user-declared
// field, so the slot it declares keeps its single-family narrow
import Foreign from "foreign";
class ForeignBase extends Foreign {
  rows = [1, 2];
  read() {
    return this.rows.at(0);
  }
}
new ForeignBase().inherited();
class BuiltInBase extends Array {
  cells = [1, 2];
  read() {
    return this.cells.includes(1);
  }
}
new BuiltInBase().read();