import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A computed key can hand the enclosing receiver to external code.
const holder = {
  rows: [],
  touch() {
    return {
      [(() => {
        const self = this;
        return sink(self);
      })()]() {}
    };
  }
};
holder.touch();
_at(_ref = holder.rows).call(_ref, 0);