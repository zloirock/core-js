class Foo {
  getItems(): number[] {
    return [];
  }
}
declare const f: Foo;
f.getItems().at(-1);
