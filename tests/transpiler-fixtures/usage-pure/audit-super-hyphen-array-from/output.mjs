// `MyAF` is `Array.from` — a function, not the Array class. `class extends MyAF` +
// `super.from(x)` reads `.from` off the function, which is undefined. `entryToGlobalHint`
// rejects method entries (`array/from` isn't `/constructor`), so `MyAF` has no Array hint
// and `super.from(x)` doesn't resolve. the plugin keeps the user's broken code unchanged
import MyAF from '@core-js/pure/actual/array/from';
class C extends MyAF {
  static collect(x) {
    return super.from(x);
  }
}