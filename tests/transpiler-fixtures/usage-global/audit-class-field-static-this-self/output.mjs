import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `this` in static method context refers to the class constructor, not instance.
// `this.x` reads static field. global-mode parity with `audit-class-field-static-this-scope`
export class C {
  static items = [1, 2, 3];
  static first() {
    return this.items.at(0);
  }
}