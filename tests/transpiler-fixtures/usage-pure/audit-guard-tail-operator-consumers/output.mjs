import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$fround from "@core-js/pure/actual/math/fround";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$EPSILON from "@core-js/pure/actual/number/epsilon";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
var _ref, _ref2, _ref5, _ref6;
// a folded guard tail ends in a bare ternary, the loosest expression there is: an OPERAND slot
// on either side of an operator swallows it, so the fold owes that consumer its parens. both
// emitters read the consumer off the AST for exactly this reason - approximating it from the
// source text mistook every operator sharing a character with something else (`===` for an
// assignment, `>=` for an arrow) and returned the operand instead of the comparison
export const eqRight = 1 === (null == (_ref = _globalThis.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(1)).call(_ref2, 0));
export const neqRight = 1 !== (null == _globalThis.window ? void 0 : _Object$assign({}, {
  a: 1
}).a);
export const gtRight = 2 > (null == _globalThis.window ? void 0 : _Math$trunc(1.5));
export const geRight = 2 >= (null == _globalThis.window ? void 0 : _Number$parseFloat('1.5'));
export const leRight = 1 <= (null == _globalThis.window ? void 0 : _Reflect$ownKeys({
  a: 1
}).length);
export const shiftRight = 4 >> (null == _globalThis.window ? void 0 : _Array$from([1]).length);

// the same slots over a CALL root, whose guard test carries the root effect. a claim with a
// MEMBER tail splits that tail differently in the two emitters - the AST one folds every step
// but the last, the text one lifts the whole tail behind the `?.` it already owns. both read
// the same value off the same guard, so the sidecar records the split rather than a defect
const cr = () => _globalThis;
export const eqRightCall = 1 === (null == cr().window ? void 0 : _Set.prototype.constructor)?.length;
export const gtRightCall = 2 > (null == cr().window ? void 0 : _Math$fround(1.5));

// the guard on the LEFT of an operator is an operand too: the folded tail may not end the
// expression there either
export const eqLeft = (null == _globalThis.window ? void 0 : _Promise$resolve(1).constructor.length) === 1;
export const shiftLeft = (null == _globalThis.window ? void 0 : _Number$parseInt('4', 10)) >> 1;

// slots that already delimit a whole expression keep the ternary BARE. `=` opens one only as a
// (compound) assignment, `>` only as an arrow - the negatives that pin the pair classification
let assigned;
assigned = null == _globalThis.window ? void 0 : _Symbol$for('x').description;
let compound = 10;
compound -= null == _globalThis.window ? void 0 : _Math$cbrt(8);
let logical = 0;
logical ||= null == _globalThis.window ? void 0 : _Number$MAX_SAFE_INTEGER;
const arrowBody = () => null == _globalThis.window ? void 0 : _Object$entries({
  a: 1
}).length;
function returned() {
  var _ref3, _ref4;
  return null == (_ref3 = _globalThis.window) ? void 0 : _keysMaybeArray(_ref4 = _Array$of(2)).call(_ref4);
}
export { assigned, compound, logical };
export const arrowValue = arrowBody();
export const returnedValue = returned().next().value;

// an `extends` clause parenthesizes the fold too - it takes a LeftHandSideExpression - so the
// last tail step rides outside behind `?.` exactly as under an operator. listing that consumer
// on one emitter only spelled the same fold two ways
const host = null == _globalThis.window ? void 0 : _self;
class Extended extends (null == _globalThis.window ? void 0 : _self.hostBox)?.Base {}
export const extendedName = _nameMaybeFunction(Extended);
export const negated = -(null == _globalThis.window ? void 0 : _self.hostBox)?.count;
export const spreadTail = [...(null == (_ref5 = _globalThis.window) ? void 0 : _valuesMaybeArray(_ref6 = _Array$of(1, 2)).call(_ref6))];
export { host };

// a ternary CONSEQUENT delimits a whole expression, so the fold stays BARE there; the right
// operand of `??` looks the same from the source and does NOT - the pair pins which slot the
// consumer actually is
export const ternaryConsequent = 1 ? null == _globalThis.window ? void 0 : _Math$sign(-2) : 0;
export const ternaryAlternate = 0 ? 9 : null == _globalThis.window ? void 0 : _Math$expm1(0);
const seed = null;
export const nullishRight = seed ?? (null == _globalThis.window ? void 0 : _Number$EPSILON);

// a for-of / for-in head holds a whole expression up to its `)`, and a case arm's assignment
// runs to the `break` - the fold stays bare in all three
export const spread = [];
for (const item of null == _globalThis.window ? void 0 : _Array$of(3, 4)) _pushMaybeArray(spread).call(spread, item);
export const keys = [];
for (const key in null == _globalThis.window ? void 0 : _Object$fromEntries([['a', 1]])) _pushMaybeArray(keys).call(keys, key);
let switched = 0;
switch (1) {
  case 1:
    switched = null == _globalThis.window ? void 0 : _Math$hypot(3, 4);
    break;
  default:
    break;
}
export { switched };