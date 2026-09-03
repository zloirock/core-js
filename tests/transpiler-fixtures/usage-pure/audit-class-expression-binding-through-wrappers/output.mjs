import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a class expression bound to a name resolves its own static field whatever wraps it between the
// declarator and the class - source parens, a cast - and the anonymous form answers like the named
// one. every row spends a method the Array and Iterator families SHARE, so each row proves its own
// narrowing: a receiver that stopped resolving brings that row's Iterator twin in beside the Array
// module. an EXPORTED binding stays generic on purpose - an importer may overwrite the field - and
// its row is the one that MUST carry the second family
const named = class X {
  static list = [1];
};
const wrapped = class Y {
  static list = [2];
};
const cast = class Z {
  static list = [3];
} as any;
const anonymous = class {
  static list = [4];
};
export const exported = class W {
  static list = [5];
};
export const r = [_mapMaybeArray(_ref = named.list).call(_ref, v => v), _filterMaybeArray(_ref2 = wrapped.list).call(_ref2, Boolean), _flatMapMaybeArray(_ref3 = cast.list).call(_ref3, v => v), _findMaybeArray(_ref4 = anonymous.list).call(_ref4, Boolean), _at(_ref5 = exported.list).call(_ref5, 0)];