import _Map from "@core-js/pure/actual/map/constructor";
// instance-method access via `super.method` (no call): the lookup is rewritten through
// the superclass binding, with the pure-mode polyfill emitted accordingly.
class C extends _Map {
  m() {
    return super.get(1);
  }
}