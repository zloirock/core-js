import _Array$from from "@core-js/pure/actual/array/from";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Computed class member keys use the enclosing this; values use the class receiver.
class C {
  [_Symbol$iterator]() {
    return this;
  }
  [_Array$from([1])[0]] = this;
  static [_Object$assign({}, {
    key: 'value'
  }).key] = this;
}