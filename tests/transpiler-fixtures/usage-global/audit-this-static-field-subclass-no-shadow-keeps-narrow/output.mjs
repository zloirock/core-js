import "core-js/modules/es.array.at";
// a subclass that does not redeclare `items` cannot change `this.items` in the inherited
// static method, so the base `number[]` narrow stays sound: `.at` keeps the Array-only
// specialization with no String fallback emitted
class Base {
  static items: number[] = [];
  static getItems() {
    return this.items;
  }
}
class Sub extends Base {
  static label = "sub";
}
Base.getItems().at(-1);