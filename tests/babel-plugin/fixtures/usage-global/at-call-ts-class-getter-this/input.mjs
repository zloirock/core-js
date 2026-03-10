class Foo {
  items: number[] = [];
  get data() { return this.items; }
}
new Foo().data.at(-1);
