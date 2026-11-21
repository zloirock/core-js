import _Array$from from "@core-js/pure/actual/array/from";
class Base extends Array {
  static read() {
    return (this === Base && !("from" in Base) ? {
      from: _Array$from.bind(this)
    } : this).from([1])[0];
  }
}
class Derived extends Base {
  static from() {
    return [9];
  }
}
export const result = [Base.read(), Derived.read()];