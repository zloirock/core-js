// a memo planted for a DISCARDED SEQUENCE ELEMENT must not walk its read past what the sequence
// evaluates ahead of it: those leading elements are discarded values, so they lift to statements of
// their own, in source order, and the memo lands behind them where the source reads the receiver
const arr = [3, [1, 2]];
const log = [];
const eff = () => { log.push('e'); return arr; };
const lead = () => { log.push('L'); return 0; };
let viaLeading, viaLeadingLen, q1;
q1 = (lead(), ({ at: viaLeading, length: viaLeadingLen } = eff()), 5);
let viaRest, viaRestOther, q2;
q2 = (lead(), ({ at: viaRest, ...viaRestOther } = eff()), 5);
let viaTwoLeads, viaTwoLeadsLen, q3;
q3 = (lead(), lead(), ({ at: viaTwoLeads, length: viaTwoLeadsLen } = eff()), 5);
// ... and with nothing ahead of it the element keeps its own slot
let viaNoLead, viaNoLeadLen, q4;
q4 = (({ at: viaNoLead, length: viaNoLeadLen } = eff()), 5);
export { viaLeading, viaLeadingLen, viaRest, viaRestOther, viaTwoLeads, viaTwoLeadsLen, viaNoLead, viaNoLeadLen };
export { q1, q2, q3, q4, log };
