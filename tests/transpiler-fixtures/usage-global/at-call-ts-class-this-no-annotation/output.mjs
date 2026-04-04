import "core-js/modules/es.array.at";
class Foo {
  items = [1, 2, 3];
  getItems() {
    return this.items;
  }
}
new Foo().getItems().at(-1);