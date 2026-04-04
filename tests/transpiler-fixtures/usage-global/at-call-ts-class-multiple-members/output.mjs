import "core-js/modules/es.array.at";
class Foo {
  count: number = 0;
  items: number[] = [];
  label: string = '';
}
const f = new Foo();
f.items.at(-1);