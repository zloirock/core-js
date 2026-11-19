import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  static items: number[] = [];
}
const f = new Foo();
// @ts-expect-error the member read is the probe, and the right answer is a type without it
f.items.at(-1);