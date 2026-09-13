// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
