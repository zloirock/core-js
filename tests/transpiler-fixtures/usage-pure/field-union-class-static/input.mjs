// Static block writes join the static field initializer.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
class Box {
  static data = [10, 20];
  static { this.data = "1020"; }
  static read() { return this.data.includes("02"); }
}
export const result = Box.read();
