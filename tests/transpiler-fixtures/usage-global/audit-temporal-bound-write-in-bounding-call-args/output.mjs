import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A field write nested in a method call's OWN argument list runs before the method body, so the
// String write into `items` must fold into the instance-field flow: the receiver of `.at` can be
// a string at runtime, so es.string.at is needed alongside es.array.at
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
const c = new C();
c.getFirst(c.items = "s");