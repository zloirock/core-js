import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
var _ref, _ref2, _ref3, _ref4, _ref5;
// every span this pipeline measures by counting brackets is TEXT that can carry a string, and a
// bracket inside one is not structure: the chain-growth gate, the layer rebalance that re-opens
// swallowed groups, the memo-slot walk and the extraction-decl split all read source through that
// lens. counted as structure they stop the span at the wrong token, and what follows is either
// truncated or swallowed. one static and one instance method per line, so a row that stops
// resolving is visible in the import set too.
export const argParen = null == (() => _globalThis)()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(')')).call(_ref, 0);
export const keyParen = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref2 = _Object$entries({
  ')': 1
})).call(_ref2);
export const tailParen = _padEndMaybeString(_ref3 = _String$fromCodePoint(40)).call(_ref3, 4, ')');
export const bothParens = null == _globalThis.window ? void 0 : _toFixedMaybeNumber(_ref4 = _Number$parseFloat('1.5(')).call(_ref4, 1);
export const nestedQuote = _includesMaybeString(_ref5 = _JSON$stringify({
  a: '")'
})).call(_ref5, 'a');

// the same lens on the extraction side: the decl split looks for the binding's own ` = `, and a
// default re-emitted from source can hold brackets and an ` = ` of its own
let seCount = 0;
seCount++;
export const hypot = _Math$hypot === void 0 ? ')' : _Math$hypot;
let seCount2 = 0;
seCount2++;
export const trunc = _Math$trunc === void 0 ? '} = x' : _Math$trunc;