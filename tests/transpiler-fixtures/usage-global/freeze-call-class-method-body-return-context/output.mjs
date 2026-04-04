class Foo {
  create() {
    return new Date();
  }
}
const f = new Foo();
Object.freeze(f.create());