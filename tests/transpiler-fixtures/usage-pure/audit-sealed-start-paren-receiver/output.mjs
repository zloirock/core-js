import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10;
// the parens around the RECEIVER end the chain there: the `?.` inside them short-circuits only the
// sealed value, and the dispatch above reads it plainly. counting that `?.` as the receiver's own
// live one lifts a guard over the whole dispatch and answers undefined where the source throws
const host = {};
export const sealedOptionalCall = null == (_ref = _flatMaybeArray(_ref2 = host.box?.missing)) ? void 0 : _at(_ref3 = _ref.call(_ref2)).call(_ref3, 0);
export const sealedDispatchCall = _at(_ref4 = host.box?.missing)?.call(_ref4, 0);
export const sealedPlainCall = _at(_ref5 = _flatMaybeArray(_ref6 = host.box?.missing).call(_ref6)).call(_ref5, 0);
export const doubledWrapper = _flatMaybeArray(_ref7 = host.box?.missing)?.call(_ref7);

// NEGATIVE: unsealed, the same `?.` guards the whole chain and the dispatch rides inside it.
// the doubled wrapper carries a sidecar: the inner parens ride along in a text splice and are
// reprinted away by the AST emitter - grouping only, the same value either way
export const unsealed = null == (_ref8 = host.box?.missing) || null == (_ref9 = _flatMaybeArray(_ref8)) ? void 0 : _at(_ref10 = _ref9.call(_ref8)).call(_ref10, 0);