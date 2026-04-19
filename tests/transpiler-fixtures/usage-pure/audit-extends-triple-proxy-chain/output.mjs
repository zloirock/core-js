import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `globalThis.self.window.Promise` - three-level proxy-global chain. `globalProxyMemberName`
// walks every intermediate link; each `self` / `window` must pass the POSSIBLE_GLOBAL_OBJECTS
// gate or the whole chain bails. `super.try(...)` routes to the Promise polyfill
class C extends _Promise {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}