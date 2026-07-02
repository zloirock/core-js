import "core-js/modules/es.array.at";
class Foo {
  static accessor items: number[] = [];
}
Foo.items.at(-1);