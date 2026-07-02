import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// `K extends number` predicate against literal-union of numeric-quoted strings
// ('0' | '1') - both have numeric shape, both pass through to true branch
type NumericFilter<K extends string> = { [P in K as P extends number ? P : never]: number[] };
declare const r: NumericFilter<'0' | '1' | 'foo'>;
_atMaybeArray(_ref = r['0']).call(_ref, 0);
_includesMaybeArray(_ref2 = r['1']).call(_ref2, 1);