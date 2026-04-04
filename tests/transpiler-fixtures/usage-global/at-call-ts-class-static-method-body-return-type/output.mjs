import "core-js/modules/es.array.at";
class Foo {
  static getItems() {
    return [1, 2, 3];
  }
}
Foo.getItems().at(-1);