// a SUBCLASS writes the inherited slot through its own `this`, which the base body never mentions
class Base {
  rows() { return [9, 10]; }
  read() { return this.rows().at(0); }
}
class Derived extends Base {
  poison() { this.rows = () => "text"; }
}
export const values = [new Derived().read()];
