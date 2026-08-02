import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a guard render that leads with `(` at the head of an ExpressionStatement fuses with an
// unterminated previous statement and turns it into a CALL (`sink = 1(...)`). the AST emitter
// reprints statements with their own semicolons, the text one edits the source in place - so it
// owes the `;` itself, on every channel that can spell a parenthesized guard
export let liftedNav = 1
null == _globalThis.window ? void 0 : _self.hostBox.run()
export let liftedMember = 2
null == _globalThis.window ? void 0 : _self.hostBox.field
export let liftedOptionalCallee = 3
null == _globalThis.window ? void 0 : _self.hostBox?.run?.()
export let liftedOperand = 4
;(null == _globalThis.window ? void 0 : _self.hostBox)?.field + 1
export let claimUnderOperator = 5
;(null == _globalThis.window ? void 0 : _Number$parseInt('4', 10)) >> 1

// renders that do NOT lead with `(` keep the source verbatim - the negatives that pin the guard
// to the leading token rather than to the statement position
export let foldedClaim = 6
null == (_ref = _globalThis.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(1)).call(_ref2, 0)
export let deleteOperand = 7
delete (null == _globalThis.window ? void 0 : _self)?.hostBox.gone
export let protoPlacement = 8
null == _globalThis.window ? void 0 : _Map.prototype.has.call(new _Map([[1, 1]]), 1)

// an UNBRACED control body holds exactly one statement: a `;` ahead of the render would empty
// the body instead of separating anything, and the `(` there follows the head's own `)`
export let unbracedBody = 9
if (unbracedBody) null == _globalThis.window ? void 0 : _self.hostBox.run()