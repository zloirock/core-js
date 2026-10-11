import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
// a sequence prefix reading an accessor runs ahead of the extraction however the file writes that key -
// through the setter of the pair, an object's or a class's static one, through `this` elsewhere, beside a
// class static: an assignment runs the setter and never replaces the getter. a read of a key only a setter
// defines runs nothing and leaves
const observed = {
  get value() {
    log();
    return 0;
  },
  set value(v) {
    log(v);
  }
};
export const at = _atMaybeString((observed.value, String.prototype));
observed.value = 2;
class Pair {
  static get count() {
    log();
    return 0;
  }
  static set count(v) {
    log(v);
  }
}
export const findLast = _findLastMaybeArray((Pair.count, Array.prototype));
Pair.count = 1;
class Box {
  static get size() {
    log();
    return 0;
  }
}
export const includes = _includesMaybeArray((Box.size, Array.prototype));
function reset() {
  this.size = 0;
}
const quiet = {
  set mode(v) {
    log(v);
  }
};
export const padEnd = _padEndMaybeString(String.prototype);