import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref2;
// a declarator drained through the whole-init MEMO route can carry ordinary claims of its own: they
// drain there too, reading the ref that route declared. skipping them dropped the extraction outright
// and left the binding UNDECLARED, which an export then referenced - output that does not parse
const log = [];
const arr = [3, [1, 2]];
const eff = () => {
  _pushMaybeArray(log).call(log, 'e');
  return arr;
};
const _ref = eff();
const viaSibling = _flatMaybeArray(_ref);
const {
    [(_pushMaybeArray(log).call(log, 'k'), 'at')]: _unused
  } = _ref,
  viaSeKey = _atMaybeArray(_ref);
const _ref3 = _sliceMaybeArray(_ref2 = eff()).call(_ref2);
const viaCallSibling = _flatMaybeArray(_ref3);
const {
    [(_pushMaybeArray(log).call(log, 'k2'), 'at')]: _unused2
  } = _ref3,
  viaCallRecv = _atMaybeArray(_ref3); // ... and the same pair on an EXPORTED host, where the undeclared name was a parse error
const _ref4 = eff();
export const viaExported = _atMaybeArray(_ref4);
export const viaExportedSibling = _flatMaybeArray(_ref4);
export const {
  [(_pushMaybeArray(log).call(log, 'k3'), 'at')]: _unused3
} = _ref4;
// ... while a lone SE-key claim and a pair without one already agreed
const _ref5 = eff();
const viaLoneSeKey = _atMaybeArray(_ref5);
const {
  [(_pushMaybeArray(log).call(log, 'k4'), 'at')]: _unused4
} = _ref5;
const _ref6 = eff();
const viaPlainPair = _atMaybeArray(_ref6);
const viaPlainSibling = _flatMaybeArray(_ref6);
export { viaSeKey, viaSibling, viaCallRecv, viaCallSibling, viaLoneSeKey, viaPlainPair, viaPlainSibling, log };