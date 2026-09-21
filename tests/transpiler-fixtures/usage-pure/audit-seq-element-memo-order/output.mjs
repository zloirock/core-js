import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref2, _ref3;
// Instance slots beside object rest keep their native reads.
// Keys and defaults retain their independent polyfills and evaluation order.
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
q1 = (lead(), _ref = eff(), viaLeading = _atMaybeArray(_ref), {
  length: viaLeadingLen
} = _ref, _ref, 5);
let viaRest, viaRestOther, q2;
q2 = (lead(), {
  at: viaRest,
  ...viaRestOther
} = eff(), 5);
let viaTwoLeads, viaTwoLeadsLen, q3;
q3 = (lead(), lead(), _ref2 = eff(), viaTwoLeads = _atMaybeArray(_ref2), {
  length: viaTwoLeadsLen
} = _ref2, _ref2, 5);
// ... and with nothing ahead of it the element keeps its own slot
let viaNoLead, viaNoLeadLen, q4;
q4 = (_ref3 = eff(), viaNoLead = _atMaybeArray(_ref3), {
  length: viaNoLeadLen
} = _ref3, _ref3, 5);
export { viaLeading, viaLeadingLen, viaRest, viaRestOther, viaTwoLeads, viaTwoLeadsLen, viaNoLead, viaNoLeadLen };
export { q1, q2, q3, q4, log };