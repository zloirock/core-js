// `entryToGlobalHint` takes only the FIRST path segment: `array/from` → `Array`.
// user-imported `MyAF` from entry `array/from` is mapped to global `Array` so
// `super.from(x)` in `class C extends MyAF` resolves to `statics.Array.from`
import MyAF from '@core-js/pure/actual/array/from';
class C extends MyAF {
  static collect(x) { return super.from(x); }
}
