// a STATIC class-valued field whose inner heritage clause writes through the OUTER `this`
// (the class object): the static field narrow widens - the cross of the two rules above
class T {
  static cells = [1, 2, 3];
  static make = class Inner extends (this.cells = "s", Object) { };
}
export const viaStaticHeritage = T.cells.at(2);
