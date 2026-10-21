import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
[_ref] = [_globalThis.Array.prototype];
flat = _flatMaybeArray(_ref);
[_ref2, _ref3] = [_globalThis.Array.prototype, 7];
at = _atMaybeArray(_ref2);
zn = _ref3;
[_ref4] = [_globalThis.Array.prototype];
deep = _findLastMaybeArray(_ref4);
[_ref5] = [kw = _globalThis];
kept = _copyWithinMaybeArray(_ref5.Array.prototype);
[{
  Array: {
    keys: named
  }
}] = [_globalThis];
let markedName;
[{
  Array: {
    keys: markedName
  }
}] = [_globalThis];
[_ref6] = [Array.prototype], null == _ref6 ? _ref6[""] : (_pushMaybeArray(log).call(log, "k"), keyed = _flatMapMaybeArray(_ref6)), {
  other
} = _ref6;
[{
  of: stat
}, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };