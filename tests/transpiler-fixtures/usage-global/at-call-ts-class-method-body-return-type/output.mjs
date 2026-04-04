import "core-js/modules/es.array.at";
class Foo {
  getItems() {
    return [1, 2, 3];
  }
}
const f = new Foo();
f.getItems().at(-1);