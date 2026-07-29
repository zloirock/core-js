import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A mixed pattern - a nested-ObjectPattern value beside flat keys - belongs to the nested mirror
// only while the mirror can actually render it. An unresolvable computed key, a duplicate resolved
// key and a non-identifier key each make it bail for good, and deferring to it then drops the flat
// sibling's polyfill to a native read. The last host is the control: with every key mirrorable the
// whole default is replaced by the synthesized literal instead.
// usage-global is not paired: this rewrite exists only on the pure path, which is what binds a
// polyfill to a destructured name.
export const unresolvableKey = (({
  Set = _Set,
  Array: {
    from = _Array$from
  },
  [getKey()]: y
} = _globalThis) => [Set, from, y])();
export const duplicateKey = (({
  Map = _Map,
  ["Map"]: alias = _Map,
  Array: {
    of = _Array$of
  }
} = _globalThis) => [Map, alias, of])();
export const nonIdentifierKey = (({
  WeakSet = _WeakSet,
  "with-dash": dashed,
  Array: {
    isArray
  }
} = _globalThis) => [WeakSet, dashed, isArray])();
export const mirrorable = (({
  Promise,
  Array: {
    at
  }
} = {
  Promise: _Promise,
  Array: {
    at: _globalThis.Array.at
  }
}) => [Promise, at])();

// a rest element is the mirror's other permanent bail, and several flat keys in front of the nested
// value are the transient case the deferral exists for - the whole default becomes the synthesized
// literal there instead of per-key inline defaults
export const restSibling = (({
  Set: S2 = _Set,
  Array: {
    of: of2 = _Array$of
  },
  ...rest
} = _globalThis) => [S2, of2, rest])();
export const twoFlatKeys = (({
  WeakMap,
  Promise: P2,
  Array: {
    from: from2
  }
} = {
  WeakMap: _WeakMap,
  Promise: _Promise,
  Array: {
    from: _Array$from
  }
}) => [WeakMap, P2, from2])();
export const nestedKeyFirst = (({
  Array: {
    at: at7
  },
  Set: S7
} = {
  Array: {
    at: _globalThis.Array.at
  },
  Set: _Set
}) => [at7, S7])();
export const twoNestedValues = (({
  Set: S8,
  Array: {
    of: of8
  },
  Promise: {
    race
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  },
  Promise: {
    race: _Promise$race
  }
}) => [S8, of8, race])();

// the same mixed pattern one level down - inside an array or object pattern - has no host the
// nested mirror can anchor to, so it never renders there and the flat sibling has to be served by
// the per-key fallback instead of waiting for a synth that will not come
export const nestedInArrayPattern = (([{
  Set: S3 = _Set,
  Array: {
    of: of3 = _Array$of
  }
} = _globalThis]) => [S3, of3])([]);
export const nestedInObjectPattern = (({
  p: {
    Map: M3 = _Map,
    Array: {
      from: from3 = _Array$from
    }
  } = _globalThis
}) => [M3, from3])({});
export const nestedTwoLevels = (([[{
  WeakSet: W3 = _WeakSet,
  Array: {
    at: at3
  }
} = _globalThis]]) => [W3, at3])([[]]);

// a statement body takes the other emission path for the same shape - the flat sibling is hoisted
// as a binding at the body top instead of becoming an inline default
export const statementBody = (([{
  Array: {
    of: of4 = _Array$of
  }
} = _globalThis]) => {
  let S4 = _Set;
  return [S4, of4];
})([]);

// hoisting the binding is refused when the name is already read by a later parameter or already
// bound in the body - both fall back to the inline default, which changes no scope
export const nameReadByLaterParam = (([{
  Set: S5 = _Set,
  Array: {
    of: of5 = _Array$of
  }
} = _globalThis], echo = S5) => {
  return [S5, of5, echo];
})([]);
export const nameBoundInBody = (([{
  Set: S6 = _Set,
  Array: {
    of: of6 = _Array$of
  }
} = _globalThis]) => {
  var S6;
  return [S6, of6];
})([]);