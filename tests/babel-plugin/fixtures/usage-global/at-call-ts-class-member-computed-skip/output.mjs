import "core-js/modules/es.array.at";
class Foo {
  items: number[] = [];
}
const f = new Foo();
const key = 'items';
f[key].at(-1);