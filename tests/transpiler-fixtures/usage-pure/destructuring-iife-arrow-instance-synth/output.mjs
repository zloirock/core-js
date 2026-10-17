import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _includes from "@core-js/pure/actual/instance/includes";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An IIFE's sole call supplies its parameter's receiver mirror.
// Each receiver evaluates once; method reads preserve the parameter's evaluation order.
// Literal receivers select typed dispatchers; unknown receivers keep the generic dispatcher.
// The throwing case stays inside an exported function so module evaluation reaches every row.
export const viaBareCallThrowsLazily = () => ((_ref, _unused = void 0) => {
  let includes = _includes(_ref);
  return includes("x");
})(arr);
export const viaLiteralArg = ((_ref2, _unused2 = void 0) => {
  let at = _atMaybeArray(_ref2);
  return at;
})([1, 2]);
export const viaCallArgRunsOnce = ((_ref3, _unused3 = void 0) => {
  let findLast = _findLastMaybeArray(_ref3);
  return findLast;
})(mk());

// the SE-tail peel reaches the inner receiver; the prefix effect stays in place and runs once
export const viaSeTailArg = ((_ref4, _unused4 = void 0) => {
  let flat = _flatMaybeArray(_ref4);
  return flat;
})((mark(), [3, [4]]));

// an UNCOVERED sibling key re-reads off the receiver value (a fresh literal read matches the
// native fresh-value semantics); aliased and defaulted props register through the same peel;
// an optional call keeps its argument; an immediate `.call` invocation uses the closed caller mirror
export const viaMixedProps = ((_ref5, _unused5 = void 0) => {
  let flatMap = _flatMapMaybeArray(_ref5);
  let {
    other
  } = _ref5;
  return [flatMap, other];
})([1, 2]);
export const viaAliasedProp = ((_ref6, _unused6 = void 0) => {
  let fli = _findLastIndexMaybeArray(_ref6);
  return fli;
})([1, 2]);
export const viaDefaultedProp = (({
  copyWithin = null
}) => copyWithin)({
  copyWithin: _copyWithinMaybeArray([1, 2])
});
export const viaOptionalCall = ((_ref7, _unused7 = void 0) => {
  let keys = _keysMaybeArray(_ref7);
  return keys;
})?.([1, 2]);
export const viaDotCall = ((_ref8, _unused8 = void 0) => {
  let values = _valuesMaybeArray(_ref8);
  return values;
}).call(null, [1, 2]);

// every immediately-invoked host shape reaches the same clause
void function (_ref9, _unused9 = void 0) {
  let atv = _atMaybeArray(_ref9);
  use(atv);
}([1, 2]);
export const viaCommaHost = (0, (_ref10, _unused10 = void 0) => {
  let toReversed = _toReversedMaybeArray(_ref10);
  return toReversed;
})([1, 2]);
export const viaFnExprValue = function (_ref11, _unused11 = void 0) {
  let findIndex = _findIndexMaybeArray(_ref11);
  return findIndex;
}([1, 2]);

// the argument pairs by the PARAMETER's position; a rest sibling keeps the whole pattern native
export const viaMultiArgPairing = ((first, _ref12, _unused12 = void 0) => {
  let entries = _entriesMaybeArray(_ref12);
  return entries;
})(other, [1, 2]);
export const viaRestSiblingBails = (({
  flat,
  ...rest
}) => [flat, rest])([1, [2]]);

// the receiver typing follows the argument's family; nested IIFEs register independently
export const viaStringArg = ((_ref13, _unused13 = void 0) => {
  let atStr = _atMaybeString(_ref13);
  return atStr;
})("abc");
export const viaNumberArg = ((_ref14, _unused14 = void 0) => {
  let toFixed = _toFixedMaybeNumber(_ref14);
  return toFixed;
})(1.5);
export const viaNestedIifes = ((_ref15, _unused15 = void 0) => {
  let fill = _fillMaybeArray(_ref15);
  return ((_ref16, _unused16 = void 0) => {
    let concat = _concatMaybeArray(_ref16);
    return concat;
  })([1, [2]]);
})([3, 4]);

// the argument position is read from the SAME resolver that located the receiver, so an argument
// the resolver expanded out of an inline-array spread keeps its receiver TYPING - deriving the
// position by identity over top-level `arguments` cannot see inside the spread and demoted these
// to the generic dispatcher. the family of each row differs so a lost position is visible as a
// wrong narrow, not just a missing one; a non-literal spread has no static position and stays native
export const viaInlineSpreadArg = ((_ref17, _unused17 = void 0) => {
  let atSpread = _atMaybeArray(_ref17);
  return atSpread;
})(...[[1, 2]]);
export const viaInlineSpreadStringArg = ((_ref18, _unused18 = void 0) => {
  let atSpreadStr = _atMaybeString(_ref18);
  return atSpreadStr;
})(...["abc"]);
export const viaInlineSpreadSecondSlot = ((first, _ref19, _unused19 = void 0) => {
  let entriesSpread = _entriesMaybeArray(_ref19);
  return entriesSpread;
})(...[other, [1, 2]]);
export const viaNonLiteralSpreadBails = ((_ref20, _unused20 = void 0) => {
  let flatSpread = _flatMaybeArray(_ref20);
  return flatSpread;
})(...mkArgs());

// a computed key that folds to a static name replays like a plain one, so it synths too;
// the NEGATIVE the shared gate keeps native is a getter-bearing literal, which is not re-eval-inert
export const viaComputedKeyFolds = (({
  ["at"]: aKey
}) => aKey)({
  at: _atMaybeArray([1, 2])
});
export const viaGetterObjectBails = (({
  flat: fg
}) => fg)({
  get flat() {
    return String;
  }
});