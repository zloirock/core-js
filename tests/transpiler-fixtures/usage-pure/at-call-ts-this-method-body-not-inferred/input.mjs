class Foo {
  getStr(): string[] { return []; }
  test() { return this.getStr(); }
}
declare const f: Foo;
f.test().at(0);
