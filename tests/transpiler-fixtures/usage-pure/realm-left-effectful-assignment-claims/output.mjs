import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A destructuring ASSIGNMENT whose init runs code claims the static off a `||` / `??` left read off the
// realm, as the declaration does: a left the build serves (`Array`, `Object`, and `Number`, which core-js
// extends in place) leaves its right dead, the claim alone in place, and a prefix ahead of a quiet selection
// stays ahead of the claim - in a bodyless slot and in a sequence element too.
let of, fromEntries, from, hasOwn;
of = _Array$of;
if (ok) fromEntries = _Object$fromEntries;
export const pair = (from = _Array$from, from([1, 2]));
export const prefixed = (log(), hasOwn = _Object$hasOwn, hasOwn({}, 'k'));
let fromAsync;
if (ok) log(), fromAsync = _Array$fromAsync;
export { of, fromEntries, from, fromAsync };
let isInteger, isFinite, parseFloat;
isInteger = _Number$isInteger;
if (ok) isFinite = _Number$isFinite;
export const parsed = (parseFloat = _Number$parseFloat, parseFloat('1'));
export { isInteger, isFinite };