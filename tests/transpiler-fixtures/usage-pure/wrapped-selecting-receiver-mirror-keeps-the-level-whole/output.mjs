import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
// Selecting wrapper routes retain the whole runtime level when spreads or later keys can affect it.
// Supported constructor branches are served; unknown alias and getter replacements stay native.
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