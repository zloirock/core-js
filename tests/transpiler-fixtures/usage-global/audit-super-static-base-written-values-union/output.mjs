import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a super-class alias written on a path the class definition may take - a conditional, a closure
// that ran, a try block - can be either constructor when `extends` captures it: usage-global unions
// the written constructors' statics beside the live init, exactly as a member read off such an alias
// does. usage-pure substitutes only a provable base and keeps every one of these native

let viaBranch = Object;
if (c) viaBranch = Array;
class Branch extends viaBranch {
  static go() {
    return super.from('ab');
  }
}
export const conditionalWrite = Branch.go();
let viaClosure = Object;
const set = () => {
  viaClosure = Promise;
};
set();
class Closure extends viaClosure {
  static go() {
    return super.allSettled([]);
  }
}
export const closureWrite = Closure.go();
let viaTry = Object;
try {
  viaTry = Map;
} catch (e) {
  void e;
}
class Try extends viaTry {
  static go() {
    return super.groupBy([], () => 1);
  }
}
export const tryWrite = Try.go();