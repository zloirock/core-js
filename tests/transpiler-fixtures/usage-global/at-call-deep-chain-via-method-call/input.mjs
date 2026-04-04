class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
const result = f.getItems();
const a = result;
const b = a;
b.at(-1);
