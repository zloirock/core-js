import "core-js/modules/es.array.at";
class Foo {
  items: number[] = [];
}
const Bar = Foo;
new Bar().items.at(-1);