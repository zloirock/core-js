class Foo {
  getItems(): Array<number> {
    return [];
  }
}
const f = new Foo();
f.getItems().at(-1);
