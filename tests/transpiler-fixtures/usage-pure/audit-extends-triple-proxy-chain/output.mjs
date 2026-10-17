import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// three-level proxy-global chain `globalThis.self.window.Promise` used as an `extends` target.
// every intermediate link is a known global alias, so `super.try(r)` must route through
// the Promise polyfill
class C extends _Promise {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}