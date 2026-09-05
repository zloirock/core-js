import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `Sub.getItems()` inherits the static method but runs it with `this` = Sub, whose `items`
// is a non-array. a narrow off the base `number[]` would emit the Array-only `.at` polyfill,
// which throws on the string value in engines without native String.prototype.at. the
// reachable subclass shadow must force the general Array + String polyfill set
class Base {
  static items: number[] = [];
  static getItems() {
    return this.items;
  }
}
class Sub extends Base {
  static items: any = "shadowed";
}
Sub.getItems().at(-1);