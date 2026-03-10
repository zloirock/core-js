class Foo {
  items: number[] = [];
  getItems() {
    return (function() { return this.items; })();
  }
}
new Foo().getItems().at(-1);
