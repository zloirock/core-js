import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  items: number[] = [];
}
const f = new Foo();
const key = 'items';
f[key].at(-1);