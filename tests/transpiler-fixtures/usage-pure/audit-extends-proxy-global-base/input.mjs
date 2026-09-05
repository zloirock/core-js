// `class Sub extends globalThis.Base` proxy-global path: the subclass-index must resolve
// `globalThis.Base` to `Base` so Sub is registered. otherwise Sub's external instance
// writes are missed when folding Base's field type, and `s.box.at(0)` falls to the
// unsafe array-narrowed polyfill while runtime sees a string
class Base {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
class Sub extends globalThis.Base {}
const s = new Sub();
s.box = "stringified";
s.first();
