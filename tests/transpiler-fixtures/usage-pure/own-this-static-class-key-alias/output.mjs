import _at from "@core-js/pure/actual/instance/at";
var _ref;
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
_at(_ref = Holder.rows).call(_ref, 0);