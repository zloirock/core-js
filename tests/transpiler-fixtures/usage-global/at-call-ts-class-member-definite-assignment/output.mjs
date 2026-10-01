import "core-js/modules/es.array.at";
class Foo {
  items!: number[];
}
const f = new Foo();
f.items.at(-1);