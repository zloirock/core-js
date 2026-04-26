// class-as-namespace via class EXPRESSION holds `Promise` in a static property; an `extends
// Box.Promise` clause on a derived class must still resolve through to the global `Promise`
// so `super.try(...)` is rewritten as the polyfilled static call.
const Box = class {
  static Promise = Promise;
};
class C extends Box.Promise {
  static run() { return super.try(() => 1); }
}
