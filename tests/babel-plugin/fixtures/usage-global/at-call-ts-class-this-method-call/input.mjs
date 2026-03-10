class Foo {
  getData(): number[] { return []; }
  process() { return this.getData(); }
}
new Foo().process().at(-1);
