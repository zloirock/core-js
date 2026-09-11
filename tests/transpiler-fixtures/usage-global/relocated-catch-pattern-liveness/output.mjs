import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a catch pattern the emitters MOVE off the clause reaches a re-parse as an ordinary declarator -
// written that way by a sibling, by an earlier tool in the pipeline, or by hand. its bindings stay
// block-scoped to that catch, so the same per-prop liveness rule applies: unread stays a native
// read. the boundaries are a declaration off ANY OTHER value, a nested block, and a read binding
let unread, read, foreign, nested;
try {
  risky1();
} catch (_ref) {
  let {
    at
  } = _ref;
  unread = 1;
}
try {
  risky2();
} catch (_ref) {
  let {
    includes
  } = _ref;
  read = includes;
}
const src = [1, 2];
try {
  risky3();
} catch (_ref) {
  let {
    flat
  } = src;
  foreign = 1;
}
try {
  risky4();
} catch (_ref) {
  {
    let {
      findLast
    } = _ref;
  }
  nested = 1;
}
console.log(unread, read, foreign, nested);