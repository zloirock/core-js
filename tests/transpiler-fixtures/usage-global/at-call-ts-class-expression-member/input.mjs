const Foo = class {
  items: number[] = [];
};
const f = new Foo();
f.items.at(-1);
