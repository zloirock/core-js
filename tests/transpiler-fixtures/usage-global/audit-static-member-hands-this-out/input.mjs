// a class opens the same channel on both surfaces: in an INSTANCE member `this` is the instance, in
// a STATIC one it is the constructor, and handing either out puts the slots it carries where no
// scan keyed on the class binding can see the writes
class Instance {
  rows = [1, 2];
  leak() {
    sink(this);
  }
  read() {
    return this.rows.at(0);
  }
}
new Instance().leak();
class Static {
  static cells = [1, 2];
  static leak() {
    sink(this);
  }
}
Static.leak();
export const seen = Static.cells.includes(1);
