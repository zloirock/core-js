import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// Instance reads preserve receiver, key and default order across host forms.
const log = [];
const k = tag => (_pushMaybeArray(log).call(log, tag), tag);
const _ref = eff(),
  viaSeq = null == _ref ? _ref[""] : (k('at'), _at(_ref)),
  viaSeqFlat = null == _ref ? _ref[""] : (k('flat'), _flatMaybeArray(_ref)),
  {
    z
  } = _ref,
  viaSeqTail = 1;
const {} = arr,
  viaIdent = (k('at'), _at(arr)),
  viaIdentFlat = null == arr ? arr[""] : (k('flat'), _flatMaybeArray(arr)),
  {
    y
  } = arr;
const _ref2 = eff(),
  viaExport = null == _ref2 ? _ref2[""] : (k('at'), _at(_ref2)),
  viaExportFlat = null == _ref2 ? _ref2[""] : (k('flat'), _flatMaybeArray(_ref2)),
  {
    w
  } = _ref2;
export { viaExport, viaExportFlat, w };
const {
  [k('at')]: viaRest,
  [k('flat')]: viaRestFlat,
  ...viaRestRest
} = arr;
if (c) var _ref3 = eff(),
  viaBodyless = null == _ref3 ? _ref3[""] : (k('at'), _at(_ref3)),
  {
    bz
  } = _ref3,
  viaBodylessTail = 2;
if (c) var _ref4 = eff(),
  viaBodylessSole = null == _ref4 ? _ref4[""] : (k('at'), _at(_ref4)),
  {
    bs
  } = _ref4;
if (c) var viaBodylessLead = 3,
  _ref5 = eff(),
  viaBodylessBehind = null == _ref5 ? _ref5[""] : (k('at'), _at(_ref5));
if (c) var {
    at: viaBodylessRest,
    ...viaBodylessRestRest
  } = eff(),
  viaBodylessRestTail = 4;
if (c) var _ref6 = eff(),
  viaBodylessSeg = null == _ref6 ? _ref6[""] : (k('at'), _at(_ref6)),
  viaBodylessSegFlat = null == _ref6 ? _ref6[""] : (k('flat'), _flatMaybeArray(_ref6)),
  {
    bq
  } = _ref6,
  viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };