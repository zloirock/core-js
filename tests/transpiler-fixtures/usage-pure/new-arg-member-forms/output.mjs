import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// polyfillable member reads around `new` in the remaining positions: a sequence receiver
// keeps its side effect and evaluation order, a paren-sealed optional callee keeps the
// null-guard inside the callee slot, an argument-less `new` of a bare method read gets
// empty construct args, a well-known-symbol read and a spread argument fold as plain args
const t1 = new Tag((_pushMaybeArray(log).call(log, 'e'), _at(arr)), 'x');
const t2 = new (arr == null ? void 0 : _includes(arr))(1);
const t3 = new (_findLastMaybeArray(arr))();
const t4 = new Tag(_getIteratorMethod(list), 'y');
const t5 = new Tag(..._flatMaybeArray(items), 'z');
const t6 = new Tag((_pushMaybeArray(log).call(log, 'k'), _includes(arr)), 'w');
const t7 = new Tag(arr == null ? void 0 : _findLastIndexMaybeArray(arr), 'v');