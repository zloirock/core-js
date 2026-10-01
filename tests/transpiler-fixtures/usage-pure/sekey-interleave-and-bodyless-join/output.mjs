import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// Instance reads preserve receiver, key and default order across host forms.
const log = [];
const k = tag => (_pushMaybeArray(log).call(log, tag), tag);
const _ref = eff(),
  viaSeq = null == _ref ? _ref[""] : (k('at'), _at(_ref)),
  _ref2 = _ref,
  viaSeqFlat = null == _ref2 ? _ref2[""] : (k('flat'), _flatMaybeArray(_ref2)),
  {
    z
  } = _ref,
  viaSeqTail = 1;
const _ref3 = arr,
  viaIdent = null == _ref3 ? _ref3[""] : (k('at'), _at(_ref3)),
  _ref4 = _ref3,
  viaIdentFlat = null == _ref4 ? _ref4[""] : (k('flat'), _flatMaybeArray(_ref4)),
  {
    y
  } = _ref3;
const _ref5 = eff(),
  viaExport = null == _ref5 ? _ref5[""] : (k('at'), _at(_ref5)),
  _ref6 = _ref5,
  viaExportFlat = null == _ref6 ? _ref6[""] : (k('flat'), _flatMaybeArray(_ref6)),
  {
    w
  } = _ref5;
export { viaExport, viaExportFlat, w };
const {
  [k('at')]: viaRest,
  [k('flat')]: viaRestFlat,
  ...viaRestRest
} = arr;
if (c) var _ref7 = eff(),
  viaBodyless = null == _ref7 ? _ref7[""] : (k('at'), _at(_ref7)),
  {
    bz
  } = _ref7,
  viaBodylessTail = 2;
if (c) var _ref8 = eff(),
  viaBodylessSole = null == _ref8 ? _ref8[""] : (k('at'), _at(_ref8)),
  {
    bs
  } = _ref8;
if (c) var viaBodylessLead = 3,
  _ref9 = eff(),
  viaBodylessBehind = null == _ref9 ? _ref9[""] : (k('at'), _at(_ref9));
if (c) var {
    at: viaBodylessRest,
    ...viaBodylessRestRest
  } = eff(),
  viaBodylessRestTail = 4;
if (c) var _ref10 = eff(),
  viaBodylessSeg = null == _ref10 ? _ref10[""] : (k('at'), _at(_ref10)),
  _ref11 = _ref10,
  viaBodylessSegFlat = null == _ref11 ? _ref11[""] : (k('flat'), _flatMaybeArray(_ref11)),
  {
    bq
  } = _ref10,
  viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };