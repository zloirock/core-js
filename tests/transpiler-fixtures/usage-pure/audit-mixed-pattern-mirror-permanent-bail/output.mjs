import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A mixed pattern - a nested-ObjectPattern value beside flat keys - belongs to the nested mirror
// only while the mirror can actually render it. An unresolvable computed key and a non-identifier
// key each make it bail for good, and deferring to it then drops the flat sibling's polyfill to a
// native read; a key the pattern repeats over LEAVES is one slot the literal spells once, so it
// rides the mirror instead - which is what binds the ponyfill of a ctor core-js REPLACES, where an
// inline default would have bound the realm's own. The last host is the control: with every key
// mirrorable the whole default is replaced by the synthesized literal instead.
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
  Map,
  ["Map"]: alias,
  Array: {
    of
  }
} = {
  Map: _Map,
  Array: {
    of: _Array$of
  }
}) => [Map, alias, of])();
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
export const restSibling = (({
  Set: S2,
  Array: {
    of: of2
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

// the same mixed pattern one level down - inside an array or object pattern - is a level the mirror
// climbs through: the default is mirrored whole for the slot the call leaves empty, and no per-key
// fallback stands beside it (what the literal supplies is never undefined)
export const nestedInArrayPattern = (([{
  Set: S3,
  Array: {
    of: of3
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => [S3, of3])([]);
export const nestedInObjectPattern = (({
  p: {
    Map: M3,
    Array: {
      from: from3
    }
  } = {
    Map: _Map,
    Array: {
      from: _Array$from
    }
  }
}) => [M3, from3])({});
export const nestedTwoLevels = (([[{
  WeakSet: W3,
  Array: {
    at: at3
  }
} = {
  WeakSet: _WeakSet,
  Array: {
    at: _globalThis.Array.at
  }
}]]) => [W3, at3])([[]]);

// a statement body, a name read by a later parameter and a name bound in the body take the same
// mirror - the body shape and the scope no longer pick an emission path here
export const statementBody = (([{
  Set: S4,
  Array: {
    of: of4
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => {
  return [S4, of4];
})([]);
export const nameReadByLaterParam = (([{
  Set: S5,
  Array: {
    of: of5
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}], echo = S5) => {
  return [S5, of5, echo];
})([]);
export const nameBoundInBody = (([{
  Set: S6,
  Array: {
    of: of6
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => {
  var S6;
  return [S6, of6];
})([]);

// ... where the mirror bails for good one level down (an unresolvable key beside the flat sibling)
// the other emission paths return: a statement body hoists the flat sibling as a binding at the body
// top, an expression body takes the inline default
export const statementBodyBail = (([{
  [getKey()]: y7,
  Array: {
    of: of7 = _Array$of
  }
} = _globalThis]) => {
  let S7 = _Set;
  return [S7, of7, y7];
})([]);
export const expressionBodyBail = (([{
  Set: S8 = _Set,
  [getKey()]: y8,
  Array: {
    of: of8 = _Array$of
  }
} = _globalThis]) => [S8, of8, y8])([]);