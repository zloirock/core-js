class Foo {
  items: number[] = [];
  getItems() { return this.items; }
}
new Foo().getItems().at(-1);
