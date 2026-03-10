class Foo {
  items: number[] = [];
  getItems() { return this.items; }
  process() { return this.getItems(); }
}
new Foo().process().at(-1);
