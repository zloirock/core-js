class Base extends Array {
  static read() { return this.from([1])[0]; }
}
class Derived extends Base {
  static from() { return [9]; }
}
export const result = [Base.read(), Derived.read()];
