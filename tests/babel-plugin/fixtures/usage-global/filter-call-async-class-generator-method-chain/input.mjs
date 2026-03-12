class Foo {
  async *iter() { yield 1; }
}
new Foo().iter().filter(fn);
