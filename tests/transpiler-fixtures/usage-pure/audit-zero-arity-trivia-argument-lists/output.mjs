import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// a call whose parens hold only trivia is still a ZERO-arg call, so no separator may precede its
// arguments: taking arity from the sliced text instead of the AST emitted `.call(recv, )`, and a
// trailing comma stops the whole module from parsing on the ES5 baseline this method targets.
// one row per renderer that joins arguments after a receiver, since each renders its own separator.
const a = [[1]];
const o = {
  m: () => [[1]]
};
export const standalone = _flatMaybeArray(a).call(a) /* depth */;
export const parenLookup = (a == null ? void 0 : _atMaybeArray(a)).call(a);
export const optionalCall = _includesMaybeArray(a)?.call(a);
export const guardBody = null == (_ref = o.m) ? void 0 : _flatMaybeArray(_ref2 = _ref.call(o) /* none */).call(_ref2);
export const hops = _flatMaybeArray(_ref3 = _flatMaybeArray(a).call(a)).call(_ref3) // tail
;
export const combinedInner = null == (_ref4 = _flatMaybeArray(a)) ? void 0 : _atMaybeArray(_ref5 = _ref4.call(a)).call(_ref5, 0);
export const combinedOuter = null == (_ref6 = _flatMaybeArray(a)) || null == (_ref7 = _ref6.call(a)) ? void 0 : _atMaybeArray(_ref7).call(_ref7);
class A extends Array {
  static f() {
    return _Array$from.call(this) /* none */;
  }
  // `this` in a static context resolves through the same inherited-static machinery
  static g() {
    return _Array$of.call(this) /* none */;
  }
}
export const inherited = A.f();
export const inheritedViaThis = A.g();

// NEGATIVE: a real argument keeps the separator, whatever trivia sits beside it
export const oneArg = _flatMaybeArray(a).call(a, /* depth */1);
export const trailingTrivia = _atMaybeArray(a).call(a, 0 /* index */);

// NEGATIVE: `new` and the static claim print their slice inside their own parens
export const built = new _Map();
export const claimed = _Array$from(/* nothing */);