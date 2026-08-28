import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a memo planted for a DISCARDED SEQUENCE ELEMENT must not walk its read past what the sequence
// evaluates ahead of it: those leading elements are discarded values, so they lift to statements of
// their own, in source order, and the memo lands behind them where the source reads the receiver
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
lead();
const _ref2 = eff();
var _unused;
q2 = (viaRest = _atMaybeArray(_ref2), {
  at: _unused,
  ...viaRestOther
} = _ref2, 5);
let viaTwoLeads, viaTwoLeadsLen, q3;
lead();
lead();
const _ref3 = eff();
q3 = (viaTwoLeads = _atMaybeArray(_ref3), {
  length: viaTwoLeadsLen
} = _ref3, 5);
// ... and with nothing ahead of it the element keeps its own slot
let viaNoLead, viaNoLeadLen, q4;
const _ref4 = eff();
q4 = (viaNoLead = _atMaybeArray(_ref4), {
  length: viaNoLeadLen
} = _ref4, 5);
export { viaLeading, viaLeadingLen, viaRest, viaRestOther, viaTwoLeads, viaTwoLeadsLen, viaNoLead, viaNoLeadLen };
export { q1, q2, q3, q4, log };