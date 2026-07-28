// pure flavor of the same rule: a provable anchor keeps the family-precise helper, an extracted
// method leaves the receiver unknown and the helper has to widen. picking the wrong family here is
// not a size question - the mismatched helper throws once the native it delegates to is absent
class Local extends Array {
  read() {
    return this.at(0);
  }
}
new Local().read();
class Borrowed extends Array {
  read() {
    return this.includes(1);
  }
}
Borrowed.prototype.read.call("abc");
