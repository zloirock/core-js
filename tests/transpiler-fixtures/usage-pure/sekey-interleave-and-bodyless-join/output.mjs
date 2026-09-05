import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// SEVERAL SE keys on one pattern interleave on both legs: native runs key, read, key, read - and the
// dispatch reads the property too - so each claim's extraction follows its own key's segment of
// the residual, the trailing plain props taking a segment of their own (memo declarator, identifier
// init and an exported host alike); a REST keeps the batch - no segment may gather the claimed keys
const log = [];
const k = tag => (_pushMaybeArray(log).call(log, tag), tag);
const _ref = eff(),
  {
    [k('at')]: _unused
  } = _ref,
  viaSeq = _at(_ref),
  {
    [k('flat')]: _unused2
  } = _ref,
  viaSeqFlat = _flatMaybeArray(_ref),
  {
    z
  } = _ref,
  viaSeqTail = 1;
const {
    [k('at')]: _unused3
  } = arr,
  viaIdent = _at(arr),
  {
    [k('flat')]: _unused4
  } = arr,
  viaIdentFlat = _flatMaybeArray(arr),
  {
    y
  } = arr;
const _ref2 = eff();
export const {
    [k('at')]: _unused5
  } = _ref2,
  viaExport = _at(_ref2),
  {
    [k('flat')]: _unused6
  } = _ref2,
  viaExportFlat = _flatMaybeArray(_ref2),
  {
    w
  } = _ref2;
const viaRest = _at(arr);
const viaRestFlat = _flatMaybeArray(arr);
const {
  [k('at')]: _unused7,
  [k('flat')]: _unused8,
  ...viaRestRest
} = arr;
// a bodyless `var` host joins the sentinel memo into its one statement, the memo the leading
// declarator (a sole declarator and a sibling host alike); where the residual holds the sentinel
// alone the memo is a `const` statement and the slot braces; a rest-kept residual splits behind
// its extraction; a segment interleaves inside the join too
if (c) var _ref3 = eff(),
  {
    [k('at')]: _unused9,
    bz
  } = _ref3,
  viaBodyless = _at(_ref3),
  viaBodylessTail = 2;
if (c) var _ref4 = eff(),
  {
    [k('at')]: _unused10,
    bs
  } = _ref4,
  viaBodylessSole = _at(_ref4);
if (c) var viaBodylessLead = 3,
  _ref5 = eff(),
  {
    [k('at')]: _unused11
  } = _ref5,
  viaBodylessBehind = _at(_ref5);
if (c) var _ref6 = eff(),
  viaBodylessRest = _at(_ref6),
  {
    at: _unused12,
    ...viaBodylessRestRest
  } = _ref6,
  viaBodylessRestTail = 4;
if (c) var _ref7 = eff(),
  {
    [k('at')]: _unused13
  } = _ref7,
  viaBodylessSeg = _at(_ref7),
  {
    [k('flat')]: _unused14
  } = _ref7,
  viaBodylessSegFlat = _flatMaybeArray(_ref7),
  {
    bq
  } = _ref7,
  viaBodylessSegTail = 5;
export { viaSeq, viaSeqFlat, z, viaSeqTail, viaIdent, viaIdentFlat, y, viaRest, viaRestFlat, viaRestRest, log };
export { viaBodyless, bz, viaBodylessTail, viaBodylessSole, bs, viaBodylessLead, viaBodylessBehind };
export { viaBodylessRest, viaBodylessRestRest, viaBodylessRestTail, viaBodylessSeg, viaBodylessSegFlat, bq, viaBodylessSegTail };