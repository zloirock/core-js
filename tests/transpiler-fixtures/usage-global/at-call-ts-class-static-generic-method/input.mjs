class Foo {
  static identity<T>(x: T): T {
    return x;
  }
}
Foo.identity([1, 2, 3]).at(-1);
