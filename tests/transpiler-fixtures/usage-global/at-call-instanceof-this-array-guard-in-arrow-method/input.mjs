class Foo {
  check(x) {
    const fn = () => { if (x instanceof this.Array) x.at(0); };
  }
}
