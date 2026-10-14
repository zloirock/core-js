import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _self from "@core-js/pure/actual/self";
var _ref;
// statements with no semicolons: a guard render leading with `(` - an operator around the folded
// value - would fuse with the unterminated statement above it into a CALL (`x = 1(...)`), so the
// reprint owes every statement its own semicolon. the renders leading with `null ==` (a lifted nav,
// member or call, a folded claim, a guarded `delete`, a prototype read) are the negatives, and an
// unbraced control body holds exactly one statement, where a `;` ahead of the render would empty it.
export let liftedNav = 1;
null == _globalThis.window ? void 0 : _self.hostBox.run();
export let liftedMember = 2;
null == _globalThis.window ? void 0 : _self.hostBox.field;
export let liftedOptionalCallee = 3;
null == _globalThis.window ? void 0 : _self.hostBox?.run?.();
export let liftedOperand = 4;
(null == _globalThis.window ? void 0 : _self.hostBox.field) + 1;
export let claimUnderOperator = 5;
(null == _globalThis.window ? void 0 : _Number$parseInt('4', 10)) >> 1;
export let foldedClaim = 6;
null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
export let deleteOperand = 7;
null == _globalThis.window ? true : delete _self.hostBox.gone;
export let protoPlacement = 8;
null == _globalThis.window ? void 0 : _Map.prototype.has.call(new _Map([[1, 1]]), 1);
export let unbracedBody = 9;
if (unbracedBody) null == _globalThis.window ? void 0 : _self.hostBox.run();