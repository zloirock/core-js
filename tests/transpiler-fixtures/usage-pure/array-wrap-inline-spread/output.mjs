import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$seal from "@core-js/pure/actual/object/seal";
// an INLINE-array spread in a wrapper literal is a longer literal: the pairing reads its items at
// their static positions, and the rewrite splices them into the level before any route edits it by
// slot. one static per row, so a row's extraction is attributable to its own shape
const viaSole = _Array$from;
const viaShifted = _Array$of;
const [, {
  of: _unused
}] = [0, Array];
const viaNested = _Object$fromEntries;
const viaInstance = _atMaybeArray([1]);
const [{
  entries: viaSelecting
}] = [c ? {
  entries: _Object$entries
} : userObj];
// ... and through the transparent wrappers a source may spell around the spread array
const viaParens = _Object$groupBy;
const viaIifeParens = (([{
  freeze: fr
}]) => fr)(...[[c ? {
  freeze: _Object$freeze
} : userObj]]);
const viaIifeSwap = (({
  hasOwn: ho
}) => ho)(...[{
  hasOwn: _Object$hasOwn
}]);
// the argument a returning directive hands on is read at the same coordinate: `viaDirective` is the
// spread array's element, so its `.at` is the array's (the `seal` claim is the row's carrier)
const viaDirective = _Object$seal(...[[1]]);
_atMaybeArray(viaDirective).call(viaDirective, 0);
export { viaSole, viaShifted, viaNested, viaInstance, viaSelecting, viaParens, viaIifeParens, viaIifeSwap, viaDirective };

// NEGATIVES: a spread of a BINDING and a spread nested inside the spread array have no static
// length; a hole spreads as `undefined`, which binds no claim - the literal stays as written
const [_ref] = [...wrapped];
const viaAlias = _keys(_ref);
const [_ref2] = [...[...[Object]]];
const viaDoubleSpread = _values(_ref2);
const [{
  assign: viaHole
}] = [...[, Object]];
const [_ref3] = [...[, [1]]];
const viaHoleInstance = _at(_ref3);
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };