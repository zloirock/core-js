import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// a conditional-receiver destructure binding a computed key off a bare global ([Set]) beside a key
// polyfillable on both branches. The bare global is one THIS PASS substitutes, so the literal takes
// the binding the key is rewritten to and never the raw name an ie:11 ReferenceError would come from
// - the pattern folds per branch and both `from` reads get their ponyfill, where asking the
// pre-rewrite spelling left them native on a floor without `Array.from`.
const cond = true;
const {
  from,
  [_Set]: ctor
} = cond ? {
  from: _Array$from,
  [_Set]: Array[_Set]
} : {
  from: _Iterator$from,
  [_Set]: _Iterator[_Set]
};
from([1, 2, 3]);
ctor;