import "core-js/modules/es.array.at";
class Foo {
  static getItems(): number[] {
    return [];
  }
}
Foo.getItems().at(-1);