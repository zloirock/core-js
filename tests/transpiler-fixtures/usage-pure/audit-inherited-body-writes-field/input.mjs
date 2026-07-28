// an inherited method runs with the SUBCLASS instance as `this`, so a base-class write lands on the
// slot the subclass declared - the write scan walks descendants and has to walk ancestors too. a base
// this module cannot read as a class (an import, a factory result) owns bodies nobody scanned at all.
// a BUILT-IN base is neither: its prototype belongs to the engine and writes no user-declared field
import Foreign from "foreign";
class Base {
  touch() {
    this.rows = "text";
  }
}
class WrittenByBase extends Base {
  rows = [1, 2];
  read() {
    return this.rows.at(0);
  }
}
new WrittenByBase().touch();
class BuiltInBase extends Array {
  cells = [1, 2];
  read() {
    return this.cells.at(0);
  }
}
new BuiltInBase().read();
class ForeignBase extends Foreign {
  slots = [1, 2];
  read() {
    return this.slots.includes(1);
  }
}
new ForeignBase().inherited();
