class Foo {
  getDate(): Date {
    return new Date();
  }
}
const f = new Foo();
Object.freeze(f.getDate());