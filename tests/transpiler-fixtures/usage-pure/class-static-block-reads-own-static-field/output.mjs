import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set";
// a static block and a later static field read a static DATA field of their own class through the
// class name: the class-scope binding is initialized before any static element runs, and the field
// evaluates before the reader - so the read resolves; a block standing BEFORE the field, or one that
// reassigns it, reads what the source reads there
class Holder {
  static M = _Map;
  static {
    use(_Map$groupBy);
  }
  static A = Array;
  static G = _Array$from;
}
class Early {
  static {
    use(Early.P?.try);
  }
  static P = _Promise;
}
class Swapped {
  static O = Object;
  static {
    Swapped.O = _Set;
    use(Swapped.O.fromEntries);
  }
}