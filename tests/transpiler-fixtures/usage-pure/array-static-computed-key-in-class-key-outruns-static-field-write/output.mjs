import _Array$from from "@core-js/pure/actual/array/from";
import _Object$values from "@core-js/pure/actual/object/values";
// Every computed class key runs before static initializers, so only Array.from is reachable here.
// An assignment outside the class runs in source order; that control needs Object.values.
let keyed = 'from';
class Keyed {
  static ran = (keyed = 'of', 1);
  static [_Array$from([1, 2]).length] = 2;
}
let plain = 'entries';
plain = 'values';
class Plain {
  static [_Object$values({
    a: 1
  }).length] = 2;
}