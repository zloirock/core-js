class Foo {
  get items(): number[] { return []; }
}
new Foo().items.at(-1);
