// An `in`-fold whose key is a `+`-concat folding to a static name (`(eff(), 'fr') + 'om'` ->
// 'from'): the fold discards the whole operand to `true`, so a side effect buried in the discarded
// concat-operand sequence prefix must still be harvested and re-emitted. without the concat case in the
// fold harvester the prefix effect was silently dropped.
const r = ((log.push(1), 'fr') + 'om') in Array;
export { r };
