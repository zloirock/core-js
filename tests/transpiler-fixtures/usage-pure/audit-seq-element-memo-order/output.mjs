import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const arr = [3, [1, 2]];
const log = [];
const eff = () => {
  _pushMaybeArray(log).call(log, 'e');
  return arr;
};
const lead = () => {
  _pushMaybeArray(log).call(log, 'L');
  return 0;
};
let viaLeading, viaLeadingLen, q1;
lead();
const _ref = eff();
q1 = (viaLeading = _atMaybeArray(_ref), {
  length: viaLeadingLen
} = _ref, 5);
let viaRest, viaRestOther, q2;
q2 = (lead(), {
  at: viaRest,
  ...viaRestOther
} = eff(), 5);
let viaTwoLeads, viaTwoLeadsLen, q3;
lead();
lead();
const _ref2 = eff();
q3 = (viaTwoLeads = _atMaybeArray(_ref2), {
  length: viaTwoLeadsLen
} = _ref2, 5);
// ... and with nothing ahead of it the element keeps its own slot
let viaNoLead, viaNoLeadLen, q4;
const _ref3 = eff();
q4 = (viaNoLead = _atMaybeArray(_ref3), {
  length: viaNoLeadLen
} = _ref3, 5);
export { viaLeading, viaLeadingLen, viaRest, viaRestOther, viaTwoLeads, viaTwoLeadsLen, viaNoLead, viaNoLeadLen };
export { q1, q2, q3, q4, log };