import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  items: number[] = [];
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
Foo.items.at(-1);