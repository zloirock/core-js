class Foo {
  items: number[] = [];
  get data() { return this.items; }
}
const f = new Foo();
f.data.at(-1);
