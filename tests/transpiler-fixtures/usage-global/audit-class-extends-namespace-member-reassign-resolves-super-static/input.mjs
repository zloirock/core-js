// `class C extends NS.Base` with `super.allSettled(...)` where the `let` NS is reassigned AFTER the class:
// `extends` captured NS.Base (Promise) at class definition, so super.allSettled is Promise.allSettled and
// usage-global injects `es.promise.all-settled` - the heritage is read through a container, not an alias
let NS = { Base: Promise };
class C extends NS.Base {
  static make() {
    return super.allSettled([]);
  }
}
NS = {};
export const settled = C.make();
