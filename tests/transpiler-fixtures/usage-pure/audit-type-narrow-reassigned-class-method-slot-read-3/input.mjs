// a STATIC slot is writable through the class binding too, which the this-write index alone
// does not see
class StaticSide {
  static list() { return [5, 6]; }
  static swap() { StaticSide.list = () => "text"; }
  static read() { return StaticSide.list().at(1); }
}
export const values = [StaticSide.read()];
