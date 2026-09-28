import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A pattern whose init reads its own binding holds nothing yet: the read is in its TDZ or sees the
// hoisted `undefined`. The extraction keeps that read, so the source's throw survives, and judging the
// extracted name as a possible Symbol.X alias stops at the binding instead of walking back into it.
// Declaration kinds, an assignment, a defaulted slot, a selecting init and a mutual pair.
const at = _at(at);
let includes = _includes(includes);
var flat = _flatMaybeArray(flat);
let fill;
fill = _fillMaybeArray(fill);
const find = (_ref = _findMaybeArray(find)) === void 0 ? null : _ref;
const findLast = _findLastMaybeArray(flag ? findLast : []);
const first = _mapMaybeArray(second);
const second = _filterMaybeArray(first);