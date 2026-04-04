import "core-js/modules/es.array.at";
class Foo {
  static get items(): number[] {
    return [];
  }
}
Foo.items.at(-1);