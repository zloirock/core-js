import _Array$from from "@core-js/pure/actual/array/from";
// non-acronym statics-only owner: Array has pure-static `from` but no pure ctor in
// compat-data. reverse-mapping `array` -> `Array` worked through kebab-fallback before
// fix; this fixture locks that pass-2 statics-only registration also covers the kebab-
// equivalent owners (sanity check that the new logic doesn't regress non-acronym path)
import MyArray from '@core-js/pure/actual/array';
class Doubler extends MyArray {
  static fromDoubled(iterable) {
    return _Array$from.call(this, iterable, x => x * 2);
  }
}