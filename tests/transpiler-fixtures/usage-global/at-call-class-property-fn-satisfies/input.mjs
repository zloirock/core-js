class Foo {
  fn = (() => [1, 2, 3]) satisfies () => number[];
}
new Foo().fn().at(-1);
