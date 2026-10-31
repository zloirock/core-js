import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const log = [];
const eff = () => {
  _pushMaybeArray(log).call(log, 'e');
  return [3, [1, 2]];
};
const {
    at: viaMemoRest,
    ...viaMemoOther
  } = eff().constructor.prototype,
  viaMemoTail = 1;
// A leading declarator with an effect must still run before the following receiver call.
const viaLeadEffect = _pushMaybeArray(log).call(log, 'L'),
  {
    at: viaAfterLead,
    ...viaAfterLeadOther
  } = eff().constructor.prototype;
export { viaMemoRest, viaMemoOther, viaMemoTail, viaLeadEffect, viaAfterLead, viaAfterLeadOther, log };