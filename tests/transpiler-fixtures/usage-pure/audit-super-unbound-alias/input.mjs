// `resolveSuperClassName` walks `P → Promise` via Identifier init, then `Promise` has no
// binding in scope → returns `Promise` (final terminator). `super.try` resolves against
// `statics.Promise.try` and is rewritten to the plugin-injected import
const P = Promise;
class C extends P {
  static run() { return super.try(() => 1); }
}
