import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Set from "@core-js/pure/actual/set/constructor";
// RestElement annotations live on `rest.typeAnnotation` in both parsers (per §6 DU-14).
// checkTypeAnnotations walker reads both `p.typeAnnotation` and `p.argument.typeAnnotation`
// for forward-compat with TS-ESTree dialects. Test that polyfill picks up Set type via
// rest annotation in both pipelines
function process(...rest: Array<Set<number>>) {
  return _flatMapMaybeArray(rest).call(rest, s => _Array$from(s));
}
process(new _Set([1]));