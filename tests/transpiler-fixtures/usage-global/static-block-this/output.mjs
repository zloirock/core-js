import "core-js/modules/es.array.includes";
class Foo {
  getItems() {
    return 'hello';
  }
  static getItems() {
    return [1, 2, 3];
  }
  static {
    this.getItems().includes('x');
  }
}