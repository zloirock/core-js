import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _Object$values from "@core-js/pure/actual/object/values";
// Literal array spreads pair their elements at known positions.
// Each supported static receives its own pure value; unknown spreads keep uncertain slots native.
const [{
  from: viaSole
}] = [...[{
  from: _Array$from
}]];
const [, {
  of: viaShifted
}] = [...[0, {
  of: _Array$of
}]];
const [[{
  fromEntries: viaNested
}]] = [...[[...[{
  fromEntries: _Object$fromEntries
}]]]];
const viaInstance = _atMaybeArray([1]);
const [_ref] = [...[c ? Object : userObj]],
  _ref2 = _ref,
  viaSelecting = null == _ref2 ? _ref2[""] : _ref2 === Object ? _Object$entries : _entries(_ref2);
// ... and through the transparent wrappers a source may spell around the spread array
const [{
  groupBy: viaParens
}] = [...[{
  groupBy: _Object$groupBy
}]];
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

// Nested literal spreads still pair exactly; binding spreads remain unknown.
// A hole spreads as `undefined` and supplies no static claim.
const [_ref3] = [...wrapped];
const viaAlias = _keys(_ref3);
const [{
  values: viaDoubleSpread
}] = [...[...[{
  values: _Object$values
}]]];
const [{
  assign: viaHole
}] = [...[, Object]];
const [_ref4] = [...[, [1]]];
const viaHoleInstance = _at(_ref4);
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };