import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const [{
  hasOwn: viaSpreadShift
}] = [c ? {
  hasOwn: _Object$hasOwn
} : userObj];
const [, {
  getOwnPropertyNames: viaSpreadAhead
}] = [0, c ? {
  getOwnPropertyNames: _Object$getOwnPropertyNames
} : userObj];
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