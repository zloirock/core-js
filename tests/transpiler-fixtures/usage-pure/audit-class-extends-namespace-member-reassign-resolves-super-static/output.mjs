import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// `class C extends NS.Base` with `super.allSettled(...)` where the `let` NS is reassigned AFTER the class:
// `extends` captured NS.Base (Promise) at class definition, so super.allSettled is provably
// Promise.allSettled and takes `_Promise$allSettled`. the census holds whatever a heritage read off a
// reassigned container may be, so `Promise` imports the namespace entry, not `*/constructor` - an accepted
// over-hold
let NS = {
  Base: _Promise
};
class C extends NS.Base {
  static make() {
    return _Promise$allSettled.call(this, []);
  }
}
NS = {};
export const settled = C.make();