// three-level proxy-global chain `globalThis.self.window.Promise` used as an `extends` target.
// every intermediate link is a known global alias, so `super.try(r)` must route through
// the Promise polyfill
class C extends globalThis.self.window.Promise {
  static run(r) { return super.try(r); }
}
