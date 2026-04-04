class Foo {
  items: number[] = [];
  getItems() {
    const fn = () => this.items;
    return fn();
  }
}
new Foo().getItems().at(-1);
