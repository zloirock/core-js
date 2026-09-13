import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Every computed class key runs before static initializers, so only Array.from is reachable here.
// An assignment outside the class runs in source order; that control needs Object.values.
let keyed = 'from';
class Keyed {
  static ran = (keyed = 'of', 1);
  static [Array[keyed]([1, 2]).length] = 2;
}
let plain = 'entries';
plain = 'values';
class Plain {
  static [Object[plain]({
    a: 1
  }).length] = 2;
}