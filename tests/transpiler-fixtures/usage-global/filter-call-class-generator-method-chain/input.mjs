class Foo {
  *iter() { yield 1; }
}
new Foo().iter().filter(fn);
