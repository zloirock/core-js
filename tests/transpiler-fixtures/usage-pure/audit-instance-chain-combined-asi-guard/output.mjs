import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// instance-chain-combined emit (`replaceInstanceChainCombined`) wraps the conditional
// rewrite в parens когда parent demands grouping (BinaryExpression here: `... + 1`).
// at a statement-leading slot the `(`-prefix would fuse with the preceding statement
// via ASI (`f()\n(_polyfill(...))` -> `f()(...)` - TypeError at runtime). asiGuardLeadingParen
// inserts a leading `;` so ASI sees a separate statement boundary
f();
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, y => y)) + 1;