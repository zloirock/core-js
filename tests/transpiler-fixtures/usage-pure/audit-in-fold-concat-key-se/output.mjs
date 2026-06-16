import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An `in`-fold whose key is a `+`-concat folding to a static name (`(eff(), 'fr') + 'om'` ->
// 'from'): the fold discards the whole operand to `true`, so a side effect buried in the discarded
// concat-operand sequence prefix must still be harvested and re-emitted. without the concat case in the
// fold harvester the prefix effect was silently dropped.
const r = (_pushMaybeArray(log).call(log, 1), true);
export { r };