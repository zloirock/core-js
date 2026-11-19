// a STATIC class-valued field: the inner method `this` is the inner class, not the outer
// one - the static field narrow survives
class S {
  static rows = [1, 2, 3];
  static make = class Inner { poison() { this.rows = "s"; } };
}
export const viaStatic = S.rows.at(1);
