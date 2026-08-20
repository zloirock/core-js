import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  static items: number[] = [];
}
const f = new Foo();
f.items.at(-1);