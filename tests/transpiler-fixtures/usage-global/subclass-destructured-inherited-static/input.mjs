// A static destructured off a user SUBCLASS that the class does not declare itself is the one it
// INHERITS: the read lands on the base, as the member read does, so the base owes its statics - on
// every host that pairs the pattern with the class: a declaration, an assignment, a loop head, an
// array wrapper, a literal slot and a parameter default. A static the subclass declares shadows it.
function use() {/* empty */}
class MyMap extends Map {}
const { groupBy } = MyMap;
class MyPromise extends Promise {}
let allSettled;
({ allSettled } = MyPromise);
class MyIterator extends Iterator {}
for (const { from } of [MyIterator]) use(from);
class MyObject extends Object {}
const [{ groupBy: groupObject }] = [MyObject];
class MyString extends String {}
const { k: { raw } } = { k: MyString };
class MyNumber extends Number {}
function isInteger({ isInteger: check } = MyNumber) { return check; }
class OwnArray extends Array { static of() { return []; } }
const { of } = OwnArray;
use(groupBy, allSettled, groupObject, raw, isInteger, of);
