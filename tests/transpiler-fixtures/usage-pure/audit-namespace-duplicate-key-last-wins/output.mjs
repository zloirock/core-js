import _Promise from "@core-js/pure/actual/promise/constructor";
// duplicate namespace key: JS keeps the LAST entry, so `NS.Base` is Object - `super.allSettled`
// resolves against Object (no such static) and must NOT be substituted with the Promise pure helper
const NS = {
  Base: _Promise,
  Base: Object
};
class C extends NS.Base {
  static make() {
    return super.allSettled([]);
  }
}
export const c = C.make();