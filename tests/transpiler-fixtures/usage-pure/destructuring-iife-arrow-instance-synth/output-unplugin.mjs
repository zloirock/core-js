import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _includes from "@core-js/pure/actual/instance/includes";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an instance method destructured off an IIFE ARGUMENT synths the argument itself - the call is
// the parameter's only call site, so the replacement is caller-correct and the argument's value is
// read once, inside the literal. an unresolvable receiver gets the generic dispatcher; a literal
// receiver refines to the typed variant; a receiver the shared gate rejects (a call) stays native.
// (kept lazy: the bare dispatcher call throws exactly like the native extraction would - see the
// e2e THROW-parity oracle - and a top-level throw would cut the module's runtime oracle short)
export const viaBareCallThrowsLazily = () => (({ includes }) => includes("x"))({ includes: _includes(arr) });
export const viaLiteralArg = (({ at }) => at)({ at: _atMaybeArray([1, 2]) });
export const viaCallArgBails = (({ findLast }) => findLast)(mk());

// the SE-tail peel reaches the inner receiver; the prefix effect stays in place and runs once
export const viaSeTailArg = (({ flat }) => flat)((mark(), { flat: _flatMaybeArray([3, [4]]) }));

// an UNCOVERED sibling key re-reads off the receiver value (a fresh literal read matches the
// native fresh-value semantics); aliased and defaulted props register through the same peel;
// an optional call still owns the argument; a `.call`-shaped invocation is no IIFE and stays native
export const viaMixedProps = (({ flatMap, other }) => [flatMap, other])({ flatMap: _flatMapMaybeArray([1, 2]), other: [1, 2].other });
export const viaAliasedProp = (({ findLastIndex: fli }) => fli)({ findLastIndex: _findLastIndexMaybeArray([1, 2]) });
export const viaDefaultedProp = (({ indexOf = null }) => indexOf)([1, 2]);
export const viaOptionalCall = (({ keys }) => keys)?.({ keys: _keysMaybeArray([1, 2]) });
export const viaDotCallStaysNative = (({ values }) => values).call(null, [1, 2]);

// every immediately-invoked host shape reaches the same clause
void function ({ at: atv }) { use(atv); }({ at: _atMaybeArray([1, 2]) });
export const viaCommaHost = (0, (({ toReversed }) => toReversed))({ toReversed: _toReversedMaybeArray([1, 2]) });
export const viaFnExprValue = function ({ findIndex }) { return findIndex; }({ findIndex: _findIndexMaybeArray([1, 2]) });

// the argument pairs by the PARAMETER's position; a rest sibling keeps the whole pattern native
export const viaMultiArgPairing = ((first, { entries }) => entries)(other, { entries: _entriesMaybeArray([1, 2]) });
export const viaRestSiblingBails = (({ flat, ...rest }) => [flat, rest])([1, [2]]);

// the receiver typing follows the argument's family; nested IIFEs register independently
export const viaStringArg = (({ at: atStr }) => atStr)({ at: _atMaybeString("abc") });
export const viaNumberArg = (({ toFixed }) => toFixed)({ toFixed: _toFixedMaybeNumber(1.5) });
export const viaNestedIifes = (({ lastIndexOf }) => (({ concat }) => concat)({ concat: _concatMaybeArray([1, [2]]) }))([3, 4]);

// NEGATIVES the shared gate keeps native: a computed key is not replayable in the synth literal;
// a getter-bearing literal is not re-eval-inert
export const viaComputedKeyBails = (({ ["at"]: aKey }) => aKey)([1, 2]);
export const viaGetterObjectBails = (({ flat: fg }) => fg)({ get flat() { return String; } });