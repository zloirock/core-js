import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `corrupt` is hoisted and CALLED before c.getFirst(), so its `c.items = "s"` write executes
// before the use even though its source position is after it - the items narrow must fold that
// in-function write (Array|string) and keep .at generic, not Array-only
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
const c = new C();
corrupt();
c.getFirst();
function corrupt() {
  c.items = "s";
}