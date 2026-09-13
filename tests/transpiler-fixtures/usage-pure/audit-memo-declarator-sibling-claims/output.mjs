import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref3;
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
const _ref2 = _ref;
const viaSeKey = null == _ref2 ? _ref2[""] : (_pushMaybeArray(log).call(log, 'k'), _atMaybeArray(_ref2));
const viaSibling = _flatMaybeArray(_ref);
const _ref4 = _sliceMaybeArray(_ref3 = eff()).call(_ref3);
const _ref5 = _ref4;
const viaCallRecv = null == _ref5 ? _ref5[""] : (_pushMaybeArray(log).call(log, 'k2'), _atMaybeArray(_ref5));
const viaCallSibling = _flatMaybeArray(_ref4); // ... and the same pair on an EXPORTED host, where the undeclared name was a parse error
const _ref6 = eff();
const _ref7 = _ref6;
const viaExported = null == _ref7 ? _ref7[""] : (_pushMaybeArray(log).call(log, 'k3'), _atMaybeArray(_ref7));
const viaExportedSibling = _flatMaybeArray(_ref6);
export { viaExported, viaExportedSibling }; // ... while a lone SE-key claim and a pair without one already agreed
const _ref8 = eff(),
  viaLoneSeKey = null == _ref8 ? _ref8[""] : (_pushMaybeArray(log).call(log, 'k4'), _atMaybeArray(_ref8));
const _ref9 = eff();
const viaPlainPair = _atMaybeArray(_ref9);
const viaPlainSibling = _flatMaybeArray(_ref9);
export { viaSeKey, viaSibling, viaCallRecv, viaCallSibling, viaLoneSeKey, viaPlainPair, viaPlainSibling, log };