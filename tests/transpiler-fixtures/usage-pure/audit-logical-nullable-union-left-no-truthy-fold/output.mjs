import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4;
// `r: number[] | null` union fold strips the null arm, but the runtime value may still be
// nullish, so `??` / `||` may yield the RIGHT operand: the always-truthy fold must not
// collapse to Array (generic dispatch). `&&` still folds to the right (nullish left
// short-circuits to a nullish result, throwing either way), and a same-family right
// keeps the Array narrow via the common-type merge; a non-nullable left still folds
declare const r: number[] | null;
declare const arr: string[];
_at(_ref = r ?? 'fallback').call(_ref, 0);
_includes(_ref2 = r || 'fallback').call(_ref2, 'f');
_atMaybeString(_ref3 = r && 'tail').call(_ref3, 1);
_includesMaybeArray(_ref4 = arr ?? 'x').call(_ref4, 'y');