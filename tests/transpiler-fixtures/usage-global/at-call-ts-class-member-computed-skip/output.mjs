import "core-js/modules/es.array.at";
// computed member access through a runtime-evaluated key cannot be statically narrowed to the
// class field; type-driven dispatch bails but the generic `array/instance/at` global side effect
// still fires for any reachable Array.prototype path
class Foo {
  items: number[] = [];
}
const f = new Foo();
const key = 'items';
f[key].at(-1);