// a static field value runs after every class key, once, where the class is defined: its write overwrites
// the write of a key below it for a read after the class, in a closure or not. an instance field's value
// runs at construction, and a class a function returns is defined in that function's frame, once per
// call, so a key write below either stays a value the read may observe
let A = Iterator;
class FieldOverKey {
  static held = (A = Object);
  [(A = Map, 'a')] = 1;
}
export const groupByLater = () => A.groupBy([1], x => x);
let B = Iterator;
class FieldOverKeyRead {
  static held = (B = Array);
  [(B = Int16Array, 'b')] = 1;
}
export const ofAfter = B.of(1);
let C = Iterator;
class InstanceFieldOverKey {
  held = (C = Array);
  [(C = Promise, 'c')] = 1;
}
export const tryLater = () => C.try(() => 1);
let D = Set;
function define() {
  return class {
    static held = (D = Array);
    [(D = Iterator, 'd')] = 1;
  };
}
define();
export const fromLater = () => D.from([1]);
define();
