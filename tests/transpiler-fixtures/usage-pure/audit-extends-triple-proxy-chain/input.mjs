// `globalThis.self.window.Promise` - three-level proxy-global chain. `globalProxyMemberName`
// walks every intermediate link; each `self` / `window` must pass the POSSIBLE_GLOBAL_OBJECTS
// gate or the whole chain bails. `super.try(...)` routes to the Promise polyfill
class C extends globalThis.self.window.Promise {
  static run(r) { return super.try(r); }
}
