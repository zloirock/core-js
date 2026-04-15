import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class X extends Array {
  static m() {
    return super.at(0);
  }
}