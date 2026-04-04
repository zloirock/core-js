class Foo {
  date: Date = new Date();
}
const f = new Foo();
Object.freeze(f?.date);
