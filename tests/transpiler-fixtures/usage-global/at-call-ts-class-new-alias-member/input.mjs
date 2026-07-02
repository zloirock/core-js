class Foo {
  items: number[] = [];
}
const Bar = Foo;
new Bar().items.at(-1);
