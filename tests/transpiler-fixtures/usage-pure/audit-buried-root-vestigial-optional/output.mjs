import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// the buried root's nav collapses through a VESTIGIAL `?.` and stops at a LIVE one. the two are told
// apart by what the optional guards, not by its presence: an optional over a value that cannot be
// undefined is dead text, one over an unponyfilled hop is the environment probe itself. the first
// spelling of this gate compared two collections of different nodes - the vestigial MEMBERS against
// the optionals' OBJECTS - so membership never held and every `?.` bailed, leaving the nav raw here
// while the AST emitter collapsed it (a diverging import set). one static and one instance method
// per line, so a row that stops resolving shows up in the import set too.
export const deadOptionalRoot = null == (_ref = (() => _self)()?.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 0);
export const deadOptionalArg = null == (_ref3 = (x => _self)(1)?.window) ? void 0 : _includesMaybeArray(_ref4 = _Object$values({
  a: 1
})).call(_ref4, 1);
export const deadOptionalDeep = null == (_ref5 = (() => _self)()?.window) ? void 0 : _flatMaybeArray(_ref6 = _Reflect$ownKeys({
  b: 2
})).call(_ref6);
export const deadOptionalParen = null == (_ref7 = (() => _self)()?.window) ? void 0 : _endsWithMaybeString(_ref8 = _String$fromCodePoint(99)).call(_ref8, 'c');

// the same nav without any optional - the collapse has always reached this one
export const plainNav = null == (_ref9 = (() => _self)()?.window) ? void 0 : _toFixedMaybeNumber(_ref10 = _Number$parseFloat('1.5')).call(_ref10, 1);

// NEGATIVE: the optional guards an unponyfilled hop, so it is load-bearing and the nav stays whole
export const liveOptional = null == (() => null == _globalThis.window ? void 0 : _self)().window ? void 0 : _Promise$resolve(4).finally(() => {});