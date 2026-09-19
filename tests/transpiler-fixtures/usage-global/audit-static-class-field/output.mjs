import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// static class field initialised with a polyfilled built-in: the initializer is
// scanned and rewritten like any other top-level expression.
class C {
  static items = Array.from([1, 2, 3]);
}