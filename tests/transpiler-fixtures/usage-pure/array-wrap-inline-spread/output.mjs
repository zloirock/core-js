import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$seal from "@core-js/pure/actual/object/seal";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [{
  from: viaSole
}] = [Array];
const [, {
  of: viaShifted
}] = [0, Array];
const [[{
  fromEntries: viaNested
}]] = [[Object]];
const viaInstance = _atMaybeArray([1]);
const [_ref] = [...[c ? Object : userObj]],
  viaSelecting = _ref === Object ? _Object$entries : _entries(_ref);
const [{
  groupBy: viaParens
}] = [Object];
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
const viaDirective = _Object$seal(...[[1]]);
_atMaybeArray(viaDirective).call(viaDirective, 0);
export { viaSole, viaShifted, viaNested, viaInstance, viaSelecting, viaParens, viaIifeParens, viaIifeSwap, viaDirective };
const [_ref2] = [...wrapped];
const viaAlias = _keys(_ref2);
const [{
  values: viaDoubleSpread
}] = [Object];
const [{
  assign: viaHole
}] = [...[, Object]];
const [_ref3] = [...[, [1]]];
const viaHoleInstance = _at(_ref3);
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };