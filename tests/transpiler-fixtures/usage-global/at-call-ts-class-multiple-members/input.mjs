class Foo {
  count: number = 0;
  items: number[] = [];
  label: string = '';
}
const f = new Foo();
f.items.at(-1);
