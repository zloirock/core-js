class Foo {
  items: number[] = [];
  getItems() {
    const x = this.items;
    return x;
  }
}
new Foo().getItems().at(-1);
