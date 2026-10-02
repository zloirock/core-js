// Removing an own field can reveal a different inherited receiver family.
const effects = [];
class Base {
  static data = "pq";
}
class Box extends Base {
  static data = [8, 9];
  static remove = () => delete this.data;
}
Box.remove();
const r = (Box.data).at(-1);
use(r, effects);
