import _Promise from "@core-js/pure/actual/promise";
// `class C extends NS.Base` with `super.allSettled(...)` where the `let` NS is reassigned AFTER the class:
// `extends` captured NS.Base (Promise) at class definition, so super.allSettled is provably
// Promise.allSettled. The retained namespace already carries that static, so the inherited read
// stays intact. Reassigning the container later cannot change the captured superclass.
let NS = {
  Base: _Promise
};
class C extends NS.Base {
  static make() {
    return super.allSettled([]);
  }
}
NS = {};
export const settled = C.make();