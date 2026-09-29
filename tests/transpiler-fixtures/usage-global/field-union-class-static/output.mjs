import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// Static block writes join the static field initializer.
class Box {
  static data = [10, 20];
  static {
    this.data = "1020";
  }
  static read() {
    return this.data.includes("02");
  }
}
export const result = Box.read();