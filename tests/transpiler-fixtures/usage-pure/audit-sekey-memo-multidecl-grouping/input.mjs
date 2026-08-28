// an SE-KEY memo in a MULTI-declarator declaration: the key's effect runs where it stands and the memo
// gives the residual and the extraction one read. an OPAQUE init takes a statement of its own ahead of
// the split - a residual could not have spelled it twice for free - while a constant literal, an
// SE-free member or branch keeps the comma join, which is the shape a second spelling would have cost
// nothing. both legs answer by that same distinction
const log = [];
const eff = () => { log.push('e'); return [3, [1, 2]]; };
const { at: viaMemoRest, ...viaMemoOther } = eff().constructor.prototype, viaMemoTail = 1;
// ... and the same shape with a leading declarator that is NOT effect-free: the read has to stay
// behind that effect on either leg
const viaLeadEffect = log.push('L'), { at: viaAfterLead, ...viaAfterLeadOther } = eff().constructor.prototype;
export { viaMemoRest, viaMemoOther, viaMemoTail, viaLeadEffect, viaAfterLead, viaAfterLeadOther, log };
