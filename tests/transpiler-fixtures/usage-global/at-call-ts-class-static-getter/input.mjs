class Foo {
  static get items(): number[] { return []; }
}
Foo.items.at(-1);
