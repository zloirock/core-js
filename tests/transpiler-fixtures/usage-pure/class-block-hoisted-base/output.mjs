import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// The base is captured at the extends clause, before the later alias write.
export function make() {
  {
    var Base = Array;
  }
  class List extends Base {
    static read() {
      return _Array$from.call(this, [1]);
    }
    static other() {
      return _Array$of.call(this, 2);
    }
  }
  Base = String;
  return List;
}