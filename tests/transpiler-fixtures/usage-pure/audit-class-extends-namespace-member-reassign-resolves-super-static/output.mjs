import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// usage-pure counterpart: `class C extends NS.Base` with `super.allSettled(...)` where NS is reassigned
// AFTER the class - `extends` captured NS.Base (Promise) at class-definition, so super.allSettled is
// provably Promise.allSettled and pure substitutes `_Promise$allSettled`. exercises the namespace-
// container resolver anchored at the class node; mirror of the usage-global counterpart.
const NS = {
  Base: _Promise
};
class C extends NS.Base {
  static make() {
    return _Promise$allSettled.call(this, []);
  }
}
NS = {};