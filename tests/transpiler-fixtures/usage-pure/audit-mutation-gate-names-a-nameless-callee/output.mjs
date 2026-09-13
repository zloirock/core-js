import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _forEach from "@core-js/pure/actual/instance/for-each";
import _Reflect from "@core-js/pure/actual/reflect";
var _ref, _ref2;
// An inline function receives its argument directly; a tag puts its interpolation
// after the strings array. Both named writes must invalidate the later return type.
// Neither write releases the namespace. Distinct receivers keep both routes observable.
const o = {};
(function (ns) {
  ns.entries = patch;
})(Object);
_forEach(_ref = Object.entries(o)).call(_ref, noop);
function tag(strings, ns) {
  ns.ownKeys = patch;
}
tag`${_Reflect}`;
_mapMaybeArray(_ref2 = _Reflect.ownKeys(o)).call(_ref2, noop);