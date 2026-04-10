declare const x: string | number[];
class Foo {
  constructor() {
    if (typeof x === "string") { x.at(-1); }
  }
}
