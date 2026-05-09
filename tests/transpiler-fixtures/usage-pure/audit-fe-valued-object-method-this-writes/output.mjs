import _at from "@core-js/pure/actual/instance/at";
// object literal with function-expression-valued property - `this` inside the FE
// binds to the receiver at call time, `this.box` write mutates the object field
// exactly like a method shorthand would. dispatch on `this.box.at(0)` widens to
// generic since the post-init write breaks the array narrow
const obj = {
  box: [1, 2, 3],
  reset: function () {
    this.box = "x";
  },
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
};
obj.reset();
obj.first();