class Foo {
  item: string = '';
  getName() { return this.item; }
}
new Foo().getName().at(-1);
