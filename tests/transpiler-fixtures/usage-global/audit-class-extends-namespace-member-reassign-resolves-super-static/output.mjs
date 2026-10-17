import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `class C extends NS.Base` with `super.allSettled(...)` where the `let` NS is reassigned AFTER the class:
// `extends` captured NS.Base (Promise) at class definition, so super.allSettled is Promise.allSettled and
// usage-global injects `es.promise.all-settled` - the heritage is read through a container, not an alias
let NS = {
  Base: Promise
};
class C extends NS.Base {
  static make() {
    return super.allSettled([]);
  }
}
NS = {};
export const settled = C.make();