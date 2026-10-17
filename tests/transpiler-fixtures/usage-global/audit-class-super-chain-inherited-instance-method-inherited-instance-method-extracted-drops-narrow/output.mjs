import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The chain walk unions the ancestors' INSTANCE sets too, not just their statics: a `<Class>.prototype` hop reaches an inherited
// method through the prototype chain, and extracting one rebinds `this` away from the instance exactly the way an extracted static
// rebinds it away from the constructor.
class Reader {
  read() {
    this.items = "poison";
    return 1;
  }
}
class Base extends Reader {}
// the inherited `read` IS extracted off the prototype, so the narrow must widen
export function inheritedInstanceMethodExtractedDropsNarrow() {
  class Reader {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  const held = Sub.prototype.read;
  return [held, Sub.items.at(0)];
}