import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// `class Sub extends globalThis.Base` proxy-global path: the subclass-index must resolve
// `globalThis.Base` to `Base` so Sub is registered. otherwise Sub's external instance
// writes are missed when folding Base's field type, and `s.box.at(0)` falls to the
// unsafe array-narrowed polyfill while runtime sees a string
class Base {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
class Sub extends _globalThis.Base {}
const s = new Sub();
s.box = "stringified";
s.first();