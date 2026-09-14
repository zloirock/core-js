import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// A binding read ahead of its own initializer holds `undefined` (a hoisted `var` declared below the
// read) or throws (a lexical binding in its TDZ). Every resolution that follows a binding to the
// literal it holds - the static container, the alias chain, the array-wrapper slot, the folded key,
// the inner default's slot - proves the initializer ran first (the dominance canon), or the rewrite
// would bind where the source throws: those reads stay native here, while their declared-before
// twins resolve. Both legs read one follower.
let r1, r2, r3, r4, r5;
try {
  const {
    a: {
      from
    }
  } = container;
  r1 = from([1]).length;
} catch (error) {
  r1 = _nameMaybeFunction(error);
}
try {
  const alias = container;
  const {
    a: {
      from
    }
  } = alias;
  r2 = from([1]).length;
} catch (error) {
  r2 = _nameMaybeFunction(error);
}
try {
  const [{
    from
  }] = wrapper;
  r3 = from([1]).length;
} catch (error) {
  r3 = _nameMaybeFunction(error);
}
{
  const {
    [key]: from
  } = Array;
  r4 = typeof from;
}
{
  const [{
    of
  } = {
    of: _Array$of
  }] = [slot];
  r5 = of(1)[0];
}
let r6;
try {
  const {
    Array: {
      from
    }
  } = realm();
  r6 = from([1]).length;
} catch (error) {
  r6 = _nameMaybeFunction(error);
}
var container = {
  a: Array
};
var realm = () => _globalThis;
var wrapper = [Array];
var key = 'from';
var slot = {
  of: x => [x, 'late']
};
const declaredFrom = _Array$from;
const wrappedFrom = _Array$from;
const keyedFrom = _Array$from;
const [{
  of: slotOf
} = Array] = [slot];
const calledFrom = _Array$from;
export { r1, r2, r3, r4, r5, r6, declaredFrom, wrappedFrom, keyedFrom, slotOf, calledFrom };