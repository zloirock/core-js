import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
// the mirror swaps the arm IN PLACE and keeps the level whole, so what a dropping consumer has to refuse
// stays pairable: an INLINE-array spread is a longer literal, and a later spread or a key nothing names
// overrides the mirrored slot exactly as it overrides the source's (last wins). a spread of a BINDING
// shifts the element by a length nothing knows, and a later getter replaces the slot: both stay native
const [{
  hasOwn: viaSpreadShift
}] = [...[c ? {
  hasOwn: _Object$hasOwn
} : userObj]];
const [, _ref] = [...[0], c ? {
  getOwnPropertyNames: _Object$getOwnPropertyNames
} : userObj];
const {
  getOwnPropertyNames: viaSpreadAhead
} = _ref;
const {
  w: {
    is: viaSpreadLevel
  }
} = {
  w: c ? {
    is: _Object$is
  } : userObj,
  ...more
};
const {
  w: {
    freeze: viaLaterKey
  }
} = {
  w: c ? {
    freeze: _Object$freeze
  } : userObj,
  [k]: 1
};
const [{
  isFrozen: viaSpreadAlias
}] = [...wrapped];
const {
  w: {
    isSealed: viaGetterLast
  }
} = {
  w: c ? Object : userObj,
  get w() {
    return userObj;
  }
};
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey, viaSpreadAlias, viaGetterLast };