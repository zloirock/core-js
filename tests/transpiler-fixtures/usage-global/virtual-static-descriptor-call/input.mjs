class Base extends Array {
  static read(n) { return this.from([n])[0]; }
}
class Derived extends Base {}
Object.defineProperty(Derived, "from", {
  value(xs) { return this === Derived ? [xs[0] + 1] : []; }
});
export const result = [Base.read(6), Derived.read(6)];
