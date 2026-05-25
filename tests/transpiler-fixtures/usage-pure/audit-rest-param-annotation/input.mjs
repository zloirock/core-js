// RestElement annotations live on `rest.typeAnnotation` in both parsers. annotation walker
// reads both `p.typeAnnotation` and `p.argument.typeAnnotation` for forward-compat with
// TS-ESTree dialects. test that polyfill picks up Set type via rest annotation in both
// pipelines
function process(...rest: Array<Set<number>>) {
  return rest.flatMap(s => Array.from(s));
}
process(new Set([1]));
