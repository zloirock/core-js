import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a SELECTING receiver under a WRAPPER mirrors per branch the way the bare init does: the host's
// literal pairs the level's slot - an element by position, a property by its plain key - and the
// polyfill lands in the constructor arm alone, the user arm staying raw. one static per row, so a
// row's mirror is attributable to its own host shape
const [{
  of: viaElementDefault
} = {}] = [c ? {
  of: _Array$of
} : userObj];
const [{
  from: viaAnd
}] = [c && {
  from: _Array$from
}];
const [{
  trunc: viaPrefix
}] = [(mark++, c ? {
  trunc: _Math$trunc
} : userObj)];
function viaParamDefault([{
  entries: e
}] = [c ? {
  entries: _Object$entries
} : userObj]) {
  return e;
}
const viaIife = (([{
  fromEntries: fe
}]) => fe)([c ? {
  fromEntries: _Object$fromEntries
} : userObj]);
const [[{
  groupBy: viaDouble
}]] = [[c ? {
  groupBy: _Object$groupBy
} : userObj]];
const {
  w: {
    keys: viaKeyed
  }
} = {
  w: c ? {
    keys: _Object$keys
  } : userObj
};
const {
  w: [{
    values: viaKeyedArray
  }]
} = {
  w: [c ? {
    values: _Object$values
  } : userObj]
};
const [{
  w: {
    sign: viaArrayKeyed
  }
}] = [{
  w: c ? {
    sign: _Math$sign
  } : userObj
}];
const {
  w: {
    assign: viaHopDefault
  } = {}
} = {
  w: c ? {
    assign: _Object$assign
  } : userObj
};
const {
  0: {
    defineProperties: viaIndexKey
  }
} = [c ? {
  defineProperties: _Object$defineProperties
} : userObj];
// ... and a hop default over a PLAIN constructor level is dead text: the extraction consumes the
// whole pattern and the emptied host leaves with it, on both legs
const viaHopDefaultPlain = _Object$hasOwn;
export { viaElementDefault, viaAnd, viaPrefix, viaParamDefault, viaIife, viaDouble, viaKeyed, viaKeyedArray, viaArrayKeyed, viaHopDefault, viaIndexKey, viaHopDefaultPlain };

// the mirror swaps the arm IN PLACE and keeps the level whole, so what a dropping consumer has to
// refuse stays pairable here: an INLINE-array spread is a longer literal, a later spread or a key
// nothing names overrides the mirrored slot exactly as it overrides the source's (last wins)
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
export { viaSpreadShift, viaSpreadAhead, viaSpreadLevel, viaLaterKey };

// NEGATIVES: a spread of a BINDING shifts the element by a length nothing here knows; a getter's
// value is a body; a computed hop key is no spelling to pair by
let cp, ck;
const [{
  isFrozen: viaSpreadAlias
}] = [...wrapped];
const {
  w: {
    seal: viaGetter
  }
} = {
  get w() {
    return c ? Object : userObj;
  }
};
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
const {
  ['w']: {
    create: viaComputedHop
  }
} = {
  w: c ? Object : userObj
};
// ... and a CAPTURED assignment yields the receiver itself, so a mirrored arm would change the
// captured value - wrapped or flat, the assignment stays raw
const viaCaptured = [{
  getPrototypeOf: cp
}] = [c ? Object : userObj];
const viaCapturedKeyed = {
  w: {
    defineProperty: ck
  }
} = {
  w: c ? Object : userObj
};
export { viaSpreadAlias, viaGetter, viaGetterLast, viaComputedHop, viaCaptured, viaCapturedKeyed, cp, ck };