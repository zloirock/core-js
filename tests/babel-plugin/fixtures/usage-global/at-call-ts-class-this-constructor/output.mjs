import "core-js/modules/es.array.at";
class Foo {
  items: number[] = [];
  constructor() {
    this.items.at(-1);
  }
}
new Foo();