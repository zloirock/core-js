import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An `in`-fold whose key is a TemplateLiteral folding to a static name (`` `${(eff(), 'fr')}om` `` ->
// 'from'): same as the concat case - the discarded template-expression sequence prefix effect must be
// harvested and re-emitted, not dropped.
const r = (_pushMaybeArray(log).call(log, 1), true);
export { r };