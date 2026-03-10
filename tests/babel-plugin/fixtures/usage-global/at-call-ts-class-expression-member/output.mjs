import "core-js/modules/es.array.at";
const Foo = class {
  items: number[] = [];
};
const f = new Foo();
f.items.at(-1);