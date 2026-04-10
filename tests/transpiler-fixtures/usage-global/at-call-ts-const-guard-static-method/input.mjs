declare const x: string | number[];
class Foo {
  static bar() {
    if (typeof x === "string") return x.at(-1);
  }
}
