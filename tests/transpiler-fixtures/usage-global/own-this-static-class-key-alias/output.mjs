import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A class field key in a static method can expose the enclosing constructor.
class Holder {
  static rows = [];
  static touch() {
    return class {
      [(() => {
        const self = this;
        return sink(self);
      })()] = 1;
    };
  }
}
Holder.touch();
Holder.rows.at(0);