import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Two classes, same name `C`, different scopes. Outer extends Array, inner extends Map.
// `super.from(x)` inside outer's static should polyfill Array.from, inner's `super.groupBy`
// should polyfill Map.groupBy. Plugin must correctly scope class resolution via the
// classBodyNode closest to the call site.
class C extends Array {
  static collect(x) {
    return _Array$from.call(this, x);
  }
  static inner() {
    class C extends _Map {
      static gather(x) {
        return _Map$groupBy.call(this, x, y => y);
      }
    }
    return C.gather([1, 2, 3]);
  }
}