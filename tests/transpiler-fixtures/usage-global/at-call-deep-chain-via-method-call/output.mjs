import "core-js/modules/es.array.at";
class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
const result = f.getItems();
const a = result;
const b = a;
b.at(-1);