// pure counterpart: a reachable subclass shadow of the static field forces the general `.at`
// helper (handles arrays and strings) instead of the array-only one, whose string fallback is
// unsound in engines without native String.prototype.at
class Base {
  static items: number[] = [];
  static getItems() { return this.items; }
}
class Sub extends Base {
  static items: any = "shadowed";
}
Sub.getItems().at(-1);
