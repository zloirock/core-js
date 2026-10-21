import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Iterator$zipKeyed from "@core-js/pure/actual/iterator/zip-keyed";
// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
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
const {
    M: _ref
  } = {
    M: KE.I
  },
  fromConst = _Iterator$from,
  constName = _nameMaybeFunction(_ref);
let {
    M: _ref2
  } = {
    M: KE.I
  },
  concatLet = _Iterator$concat,
  letName = _nameMaybeFunction(_ref2);
var {
    M: _ref3
  } = {
    M: KE.I
  },
  zipVar = _Iterator$zip,
  varName = _nameMaybeFunction(_ref3);
const {
    M: _ref4
  } = {
    M: KE.I
  },
  zipKeyedExport = _Iterator$zipKeyed,
  exportName = _nameMaybeFunction(_ref4);
export { zipKeyedExport, exportName };
const run = () => {
  const {
      M: _ref5
    } = {
      M: KE.A
    },
    ofArrow = _Array$of,
    arrowName = _nameMaybeFunction(_ref5);
  return [ofArrow, arrowName];
};
use(fromConst, constName, concatLet, letName, varName, zipVar, run);