import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// A static destructured off a user SUBCLASS that the class does not declare itself is the one it
// INHERITS: the read lands on the base, as the member read does, so the base owes its statics - on
// every host that pairs the pattern with the class: a declaration, an assignment, a loop head, an
// array wrapper, a literal slot and a parameter default. A static the subclass declares shadows it.
function use() {/* empty */}
class MyMap extends Map {}
const {
  groupBy
} = MyMap;
class MyPromise extends Promise {}
let allSettled;
({
  allSettled
} = MyPromise);
class MyIterator extends Iterator {}
for (const {
  from
} of [MyIterator]) use(from);
class MyObject extends Object {}
const [{
  groupBy: groupObject
}] = [MyObject];
class MyString extends String {}
const {
  k: {
    raw
  }
} = {
  k: MyString
};
class MyNumber extends Number {}
function isInteger({
  isInteger: check
} = MyNumber) {
  return check;
}
class OwnArray extends Array {
  static of() {
    return [];
  }
}
const {
  of
} = OwnArray;
use(groupBy, allSettled, groupObject, raw, isInteger, of);