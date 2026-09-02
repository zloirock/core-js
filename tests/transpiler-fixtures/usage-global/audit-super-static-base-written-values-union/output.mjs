import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
  viaTry = Reflect;
} catch (e) {
  void e;
}
class Try extends viaTry {
  static go() {
    return super.ownKeys({});
  }
}
export const tryWrite = Try.go();