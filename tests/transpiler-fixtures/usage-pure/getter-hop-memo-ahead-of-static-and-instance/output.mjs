import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Iterator$zipKeyed from "@core-js/pure/actual/iterator/zip-keyed";
// a nested level read through a user GETTER (`{ M: KE.I }`) by a static and an instance member
// memoizes the getter's value once, AHEAD of the static's binding - the getter runs before the
// pattern binds anything - as a `const` whatever the host's kind, and the replay of the flattened
// level does not read the getter a second time
class KE {
  static get I() {
    log();
    return _Iterator;
  }
  static get A() {
    log();
    return Array;
  }
}
const _ref = KE.I;
const fromConst = _Iterator$from;
const constName = _nameMaybeFunction(_ref);
const {
  M: {
    name: _unused
  }
} = {
  M: _ref
};
const _ref2 = KE.I;
let concatLet = _Iterator$concat;
let letName = _nameMaybeFunction(_ref2);
let {
  M: {
    name: _unused2
  }
} = {
  M: _ref2
};
const _ref3 = KE.I;
var zipVar = _Iterator$zip;
var varName = _nameMaybeFunction(_ref3);
var {
  M: {
    name: _unused3
  }
} = {
  M: _ref3
};
const _ref4 = KE.I;
export const zipKeyedExport = _Iterator$zipKeyed;
export const exportName = _nameMaybeFunction(_ref4);
export const {
  M: {
    name: _unused4
  }
} = {
  M: _ref4
};
const run = () => {
  const _ref5 = KE.A;
  const ofArrow = _Array$of;
  const arrowName = _nameMaybeFunction(_ref5);
  const {
    M: {
      name: _unused5
    }
  } = {
    M: _ref5
  };
  return [ofArrow, arrowName];
};
use(fromConst, constName, concatLet, letName, varName, zipVar, run);