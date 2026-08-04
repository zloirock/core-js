import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// @flow
// Flow's ambient function keeps its whole signature on the declared id's annotation, while the TS
// spelling puts params and return on the declaration itself - so a reader that only knows the
// declaration slot found no return type and the call widened. Distinct methods per arm:
// Array -> es.array.at, string -> es.string.includes.
declare function rows(): Array<number>;
declare function label(): string;
_atMaybeArray(_ref = rows()).call(_ref, 0);
_includesMaybeString(_ref2 = label()).call(_ref2, 'x');