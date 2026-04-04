import "core-js/modules/es.array.at";
class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
f?.getItems().at(-1);