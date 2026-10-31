import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// a computed static key read INSIDE an instance field initializer is read at `new`-time, after the
// write that textually follows the class: the reaching definition is not the textually-last write
// before the read, so no single value is proven. usage-pure leaves the read verbatim (substituting
// `of` would call the wrong static), usage-global injects every value the key can hold
export function f() {
  let K = 'from';
  K = 'of';
  class C {
    p = Array[K]([1, 2]);
  }
  K = 'from';
  return new C();
}