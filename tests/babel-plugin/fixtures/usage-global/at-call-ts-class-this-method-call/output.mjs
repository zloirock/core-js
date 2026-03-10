import "core-js/modules/es.array.at";
class Foo {
  getData(): number[] {
    return [];
  }
  process() {
    return this.getData();
  }
}
new Foo().process().at(-1);