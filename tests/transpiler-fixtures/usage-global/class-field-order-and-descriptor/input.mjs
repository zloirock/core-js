class A {
  static rows = "abc";
  get own() { return [5]; }
}
class B extends A {
  static previous = this.rows.at(0);
  static rows = [7];
}
const b = new B();
const first = b.own.at(0);
Object.defineProperty(b, "own", { value: "xyz" });
export const result = [B.previous, B.rows.at(0), first, b.own.at(-1)];
