import "core-js/modules/es.array.at";
class Foo {
  items: number[] = [];
}
const f = new Foo();
const items = f.items;
items.at(-1);