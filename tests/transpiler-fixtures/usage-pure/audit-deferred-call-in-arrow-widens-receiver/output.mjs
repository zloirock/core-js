import _at from "@core-js/pure/actual/instance/at";
// Same deferred-call widening as the function-declaration case, but the call sits inside an arrow.
// The enclosing-function walk recognizes the arrow too, so `o.read()` is deferred: it runs after
// `o.items` is reassigned to a string, the receiver `this.items` is `number[] | string`, and `.at`
// gets the generic polyfill.
const o = {
  items: [1, 2, 3],
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
};
const run = () => o.read();
o.items = "string";
run();