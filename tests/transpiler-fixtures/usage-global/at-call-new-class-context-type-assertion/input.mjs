class Foo {
  items: string[] = ['a', 'b'];
}
const Cls = <typeof Foo>Foo;
new Cls().items.at(-1);
