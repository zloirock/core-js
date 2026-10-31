import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// a call whose parens hold only trivia is still a ZERO-arg call, so no separator may precede its
// arguments: taking arity from the sliced text instead of the AST emitted `.call(recv, )`, and a
// trailing comma stops the whole module from parsing on the ES5 baseline this method targets.
// one row per renderer that joins arguments after a receiver, since each renders its own separator.
const a = [[1]];
export const combinedInner = null == (_ref = _flatMaybeArray(a)) ? void 0 : _atMaybeArray(_ref2 = _ref.call(a) /* none */).call(_ref2, 0);