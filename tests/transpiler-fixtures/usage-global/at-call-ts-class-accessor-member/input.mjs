class Foo {
  accessor items: number[] = [];
}
const f = new Foo();
f.items.at(-1);
