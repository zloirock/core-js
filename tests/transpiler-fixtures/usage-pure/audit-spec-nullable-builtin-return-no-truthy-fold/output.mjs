import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `Array#find` returns `element | undefined` per spec, so `??` may yield the string
// fallback: the element narrow is marked (nullable in known-built-in-return-types) and
// must dispatch generically, not through an array-Maybe. the `.find` call itself keeps
// the array-Maybe on its own receiver
declare const a: number[][];
_at(_ref = _findMaybeArray(a).call(a, v => v.length > 0) ?? 'fallback').call(_ref, 0);