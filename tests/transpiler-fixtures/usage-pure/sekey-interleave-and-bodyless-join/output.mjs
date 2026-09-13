import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const log = [];
const k = tag => (_pushMaybeArray(log).call(log, tag), tag);
const _ref = eff(),
  _ref2 = _ref,
  viaSeq = null == _ref2 ? _ref2[""] : (k('at'), _at(_ref2)),
  _ref3 = _ref,
  viaSeqFlat = null == _ref3 ? _ref3[""] : (k('flat'), _flatMaybeArray(_ref3)),
  {
    z
  } = _ref,
  viaSeqTail = 1;
const _ref4 = arr,
  _ref5 = _ref4,
  viaIdent = null == _ref5 ? _ref5[""] : (k('at'), _at(_ref5)),
  _ref6 = _ref4,
  viaIdentFlat = null == _ref6 ? _ref6[""] : (k('flat'), _flatMaybeArray(_ref6)),
  {
    y
  } = _ref4;
const _ref7 = eff(),
  _ref8 = _ref7,
  viaExport = null == _ref8 ? _ref8[""] : (k('at'), _at(_ref8)),
  _ref9 = _ref7,
  viaExportFlat = null == _ref9 ? _ref9[""] : (k('flat'), _flatMaybeArray(_ref9)),
  {
    w
  } = _ref7;
export { viaExport, viaExportFlat, w };
const {
  [k('at')]: viaRest,
  [k('flat')]: viaRestFlat,
  ...viaRestRest
} = arr;
if (c) var _ref10 = eff(),
  _ref11 = _ref10,
  viaBodyless = null == _ref11 ? _ref11[""] : (k('at'), _at(_ref11)),
  {
    bz
  } = _ref10,
  viaBodylessTail = 2;
if (c) var _ref12 = eff(),
  _ref13 = _ref12,
  viaBodylessSole = null == _ref13 ? _ref13[""] : (k('at'), _at(_ref13)),
  {
    bs
  } = _ref12;
if (c) var viaBodylessLead = 3,
  _ref14 = eff(),
  viaBodylessBehind = null == _ref14 ? _ref14[""] : (k('at'), _at(_ref14));
if (c) var {
    at: viaBodylessRest,
    ...viaBodylessRestRest
  } = eff(),
  viaBodylessRestTail = 4;
if (c) var _ref15 = eff(),
  _ref16 = _ref15,
  viaBodylessSeg = null == _ref16 ? _ref16[""] : (k('at'), _at(_ref16)),
  _ref17 = _ref15,
  viaBodylessSegFlat = null == _ref17 ? _ref17[""] : (k('flat'), _flatMaybeArray(_ref17)),
  {
    bq
  } = _ref15,
  viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };