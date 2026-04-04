import "core-js/modules/es.array.at";
class Foo {
  identity(x) {
    return x;
  }
}
const f = new Foo();
f.identity([1, 2, 3]).at(-1);