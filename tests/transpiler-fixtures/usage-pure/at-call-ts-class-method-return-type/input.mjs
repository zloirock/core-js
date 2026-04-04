class Foo {
  getItems(): number[] {
    return [];
  }
}
const f = new Foo();
f.getItems().at(-1);
