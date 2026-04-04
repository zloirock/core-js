import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Realm {
  check(x) {
    if (x instanceof this.Array) x.at(0);
  }
}