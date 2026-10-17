import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Flow `?T` admits null | undefined: the wrapper is not transparent for truthiness, so
// `??` may yield the string fallback and must dispatch generically, not through an
// array-Maybe (which would reach a string receiver on the nullish path)
declare var r: ?number[];
_at(_ref = r ?? 'fallback').call(_ref, 0);