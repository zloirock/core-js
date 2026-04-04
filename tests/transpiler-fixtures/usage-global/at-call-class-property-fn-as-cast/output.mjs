import "core-js/modules/es.array.at";
class Foo {
  fn = (() => [1, 2, 3]) as () => number[];
}
new Foo().fn().at(-1);