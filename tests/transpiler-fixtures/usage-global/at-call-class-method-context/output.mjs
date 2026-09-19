import "core-js/modules/es.array.at";
class Foo {
  items: string[] = [];
  getFirst() {
    return this.items.at(0);
  }
}