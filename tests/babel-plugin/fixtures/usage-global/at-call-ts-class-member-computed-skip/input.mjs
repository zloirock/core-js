class Foo {
  items: number[] = [];
}
const f = new Foo();
const key = 'items';
f[key].at(-1);
