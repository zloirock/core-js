class Foo {
  items: Date = new Date();
}
const f = new Foo();
Object.freeze(f.items);