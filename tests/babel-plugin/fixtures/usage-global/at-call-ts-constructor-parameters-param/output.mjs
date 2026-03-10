import "core-js/modules/es.array.at";
declare class Foo {
  constructor(a: number);
}
function foo(x: ConstructorParameters<typeof Foo>) {
  x.at(-1);
}