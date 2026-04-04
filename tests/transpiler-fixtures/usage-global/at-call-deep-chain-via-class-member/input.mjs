class Foo {
  items: number[] = [];
}
const f = new Foo();
const items = f.items;
const a = items;
const b = a;
b.at(-1);
