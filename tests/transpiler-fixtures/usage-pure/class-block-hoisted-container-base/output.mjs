import _Array$from from "@core-js/pure/actual/array/from";
{
  var NS = {
    Base: Array
  };
}
class List extends NS.Base {
  static read() {
    return _Array$from.call(this, [9]);
  }
}