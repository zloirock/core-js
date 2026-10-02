// Discarding a known value reader does not expose the class or its prototype methods.
class Box {
  static rows = [8, 9];
  data = 0;
  read() {
    return this.data;
  }
}
Object.values(Box);
use(Box.rows.at(-1));
