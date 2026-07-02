import "core-js/modules/es.array.at";
class Foo {
  static items: number[] = [];
  static getItems() {
    return this.items;
  }
}
Foo.getItems().at(-1);