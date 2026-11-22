import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// Each private binding has an array field. The exported field can be replaced by an importer.
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
export const r = [_mapMaybeArray(_ref = named.list).call(_ref, v => v), (_filterMaybeArray(_ref2 = wrapped.list) || 0).call(_ref2, Boolean), _flatMapMaybeArray(_ref3 = cast.list).call(_ref3, v => v), (_findMaybeArray(_ref4 = anonymous.list) || 0).call(_ref4, Boolean), _atMaybeArray(_ref5 = named.list).call(_ref5, 0), _atMaybeArray(_ref6 = wrapped.list).call(_ref6, 0), _atMaybeArray(_ref7 = cast.list).call(_ref7, 0), _atMaybeArray(_ref8 = anonymous.list).call(_ref8, 0), _at(_ref9 = exported.list).call(_ref9, 0)];