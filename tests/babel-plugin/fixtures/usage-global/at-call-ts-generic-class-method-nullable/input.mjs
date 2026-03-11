class Foo {
  bar<T>(x: T): T | null {
    return x;
  }
}
new Foo().bar([1, 2, 3]).at(-1);
