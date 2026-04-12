import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static f = () => _Array$from.call(this, []);
}