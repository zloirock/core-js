import "core-js/modules/es.array.at";
class Foo {
  items: number[] | null = null;
}
new Foo().items.at(-1);