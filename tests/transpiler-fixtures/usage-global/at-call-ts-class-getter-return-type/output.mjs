import "core-js/modules/es.array.at";
class Foo {
  get items(): number[] {
    return [];
  }
}
new Foo().items.at(-1);