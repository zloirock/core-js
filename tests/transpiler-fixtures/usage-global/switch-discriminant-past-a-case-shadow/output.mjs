import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the switch DISCRIMINANT is evaluated in the enclosing environment, so a case-level lexical
// does not cover it, while a `var` in the same case does - it hoists to the function scope.
// the third line reads inside the case under its own shadow and the fourth has no shadow at
// all; one family per line so a lost decision shows up in the import set.
switch (Object.entries({
  a: 1
}).length) {
  case 1:
    let Object = 1;
    break;
}
switch (Reflect.ownKeys({
  b: 2
}).length) {
  case 1:
    var Reflect = 1;
    break;
}
switch (0) {
  case 1:
    let Set = 1;
    new Set([1]);
    break;
}
switch (0) {
  case 1:
    Promise.allSettled([]);
    break;
}