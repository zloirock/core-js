import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// a TS cast layer sits BETWEEN the probe nav and its tail. the render replaces the nav span, which
// starts after the cast's opening paren, while the sliced tail still carries its closing one - the
// slice is unbalanced on its own and only holds where the surrounding source closes it. every
// consumer that reuses it (a memo body, a composition needle) inherits that, so the render stands
// down here and the raw source keeps its own shape
_globalThis.tsBox = {
  n: 4,
  inner: {
    n: 5
  },
  list: ['ab', 'cd']
};
export const castThenMemberDispatch = null == (_ref = ((null == _globalThis.window ? void 0 : _self.tsBox) as any).list) ? void 0 : _at(_ref).call(_ref, 0);
export const castThenMemberPlain = ((null == _globalThis.window ? void 0 : _self.tsBox) as any).list;
export const doubleCastDispatch = null == (_ref2 = ((null == _globalThis.window ? void 0 : _self.tsBox) as any).list as any[]) ? void 0 : _atMaybeArray(_ref2).call(_ref2, 0);

// a cast around the TAIL instead of the nav leaves the nav span whole, so the render applies
export const castOnTail = null == (_ref3 = (null == _globalThis.window ? void 0 : _self.tsBox.list) as any[]) ? void 0 : _atMaybeArray(_ref3).call(_ref3, 0);
export const castOnValue = (null == _globalThis.window ? void 0 : _self.tsBox.n) as number;
export const nonNullOnValue = (null == _globalThis.window ? void 0 : _self.tsBox.n)!;

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref4 = _atMaybeArray(_ref5 = ['ab', 'cd']).call(_ref5, (null == _globalThis.window ? void 0 : _self.tsBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref4).call(_ref4, 'a');

// layers STACK: a non-null inside a cast leaves TWO closers between the leaf and the tail, and the
// rebalance owes one step per layer. dropping only the last one left a stray closer in the guard
export const stackedNonNullThenCast = null == (_ref6 = ((null == _globalThis.window ? void 0 : _self.tsBox)! as any).arr) ? void 0 : _at(_ref6).call(_ref6, 0);
export const stackedCastThenNonNull = null == (_ref7 = ((null == _globalThis.window ? void 0 : _self.tsBox) as any)!.arr) ? void 0 : _at(_ref7).call(_ref7, 0);
export const bareNonNullLayer = null == (_ref8 = (null == _globalThis.window ? void 0 : _self.tsBox)!.arr) ? void 0 : _at(_ref8).call(_ref8, 0);
export const doubleParenLayer = null == (_ref9 = (null == _globalThis.window ? void 0 : _self.tsBox).arr) ? void 0 : _at(_ref9).call(_ref9, 0);