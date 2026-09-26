import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a class getter declares its return on the node (babel) but nested on `value.returnType` (oxc/ESTree, a
// TSEmptyBodyFunctionExpression). the type-member reader must read the getter RETURN, not the function value,
// so a 2-hop chain off the getter (`s.bucket.items`) narrows identically on both parsers. previously the bare
// `?? m.value` read the function on oxc -> unplugin lost the narrow past the getter (generic) while babel
// narrowed - a parser-asymmetric import-set divergence
interface Bucket {
  items: number[];
  label: string;
}
declare class Store {
  get bucket(): Bucket;
}
declare const s: Store;
_atMaybeArray(_ref = s.bucket.items).call(_ref, -1);
_includesMaybeString(_ref2 = s.bucket.label).call(_ref2, "x");