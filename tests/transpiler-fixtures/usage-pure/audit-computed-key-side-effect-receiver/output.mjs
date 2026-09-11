import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// a side-effecting receiver combined with a side-effecting computed instance-method key. the
// receiver memo is hoisted ahead of the key SE (`(_ref = recv, key, _method(_ref).call(_ref))`)
// so the receiver evaluates first (native order) while the polyfill still applies. covers a single
// key SE, a multi-element key sequence, and a member-chain receiver with a trailing argument
export const a = (_ref = getObj(), p(), _at(_ref).call(_ref, -1));
export const b = (_ref2 = getObj(), c1(), c2(), _flatMaybeArray(_ref2).call(_ref2));
export const c = (_ref3 = getList().rows, p(), _findLastMaybeArray(_ref3).call(_ref3, side()));