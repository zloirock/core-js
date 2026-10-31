// `MyAF` is imported from a method entry (`array/from`), which is a function, not the
// Array constructor. extending a method import is user code that cannot be treated as
// extending `Array`, so `super.from(x)` has no Array context and no polyfill is emitted;
// plugin leaves the user's (semantically broken) code unchanged
import MyAF from '@core-js/pure/actual/array/from';
class C extends MyAF {
  static collect(x) { return super.from(x); }
}
