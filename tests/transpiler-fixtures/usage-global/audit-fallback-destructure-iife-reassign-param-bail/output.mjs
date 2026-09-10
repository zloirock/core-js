import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
import "core-js/modules/es.string.iterator";
// negative case: prefix statement REASSIGNS the param. `arg = otherFn();` rebinds arg
// before `return arg;`, so identity peel would incorrectly lift Array as the value
// (runtime returns otherFn()'s result instead). `bodyPrefixReassignsParams` catches the
// Identifier-left AssignmentExpression and bails the peel. `Result` stays unresolved,
// no over-emission. regression guard for the SE-prefix branch.
const Result = (arg => {
  arg = otherFn();
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);