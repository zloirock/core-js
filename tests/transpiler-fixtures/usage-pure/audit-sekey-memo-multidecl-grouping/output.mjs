import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// an SE-KEY memo in a MULTI-declarator declaration: the key's effect runs where it stands and the memo
// gives the residual and the extraction one read. an OPAQUE init takes a statement of its own ahead of
// the split - a residual could not have spelled it twice for free - while a constant literal, an
// SE-free member or branch keeps the comma join, which is the shape a second spelling would have cost
// nothing. both legs answer by that same distinction
const log = [];
const eff = () => {
  _pushMaybeArray(log).call(log, 'e');
  return [3, [1, 2]];
};
const _ref = eff().constructor.prototype;
const viaMemoRest = _at(_ref);
const {
  at: _unused,
  ...viaMemoOther
} = _ref;
const viaMemoTail = 1; // ... and the same shape with a leading declarator that is NOT effect-free: the read has to stay
// behind that effect on either leg
const viaLeadEffect = _pushMaybeArray(log).call(log, 'L');
const _ref2 = eff().constructor.prototype;
const viaAfterLead = _at(_ref2);
const {
  at: _unused2,
  ...viaAfterLeadOther
} = _ref2;
export { viaMemoRest, viaMemoOther, viaMemoTail, viaLeadEffect, viaAfterLead, viaAfterLeadOther, log };