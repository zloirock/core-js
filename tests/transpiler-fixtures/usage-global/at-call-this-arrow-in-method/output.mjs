import "core-js/modules/es.array.at";
class Foo extends Array {
  bar() {
    const f = () => this.at(0);
  }
}