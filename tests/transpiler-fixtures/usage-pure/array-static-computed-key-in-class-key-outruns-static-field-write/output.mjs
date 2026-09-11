import _Object$values from "@core-js/pure/actual/object/values";
// every computed key of a class evaluates at class-definition time, ahead of every static field
// initializer, so a key read in one observes the declarator's value rather than the write the source
// places above it - both statics are owed. the write standing OUTSIDE a class is the negative:
// nothing reorders it, so it dominates the key read and only the written key injects
let keyed = 'from';
class Keyed {
  static ran = (keyed = 'of', 1);
  static [Array[keyed]([1, 2]).length] = 2;
}
let plain = 'entries';
plain = 'values';
class Plain {
  static [_Object$values({
    a: 1
  }).length] = 2;
}