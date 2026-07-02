class Foo {
  items: string[] = ['a', 'b'];
}
const Cls = Foo as typeof Foo;
new Cls().items.at(-1);
