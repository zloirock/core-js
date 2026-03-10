import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Foo {
  items: number[] = [];
  getItems() {
    return function () {
      return this.items;
    }();
  }
}
new Foo().getItems().at(-1);