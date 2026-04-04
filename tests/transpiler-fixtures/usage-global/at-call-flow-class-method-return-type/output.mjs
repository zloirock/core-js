import "core-js/modules/es.array.at";
class Foo {
  getItems(): Array<number> {
    return [];
  }
}
const f = new Foo();
f.getItems().at(-1);