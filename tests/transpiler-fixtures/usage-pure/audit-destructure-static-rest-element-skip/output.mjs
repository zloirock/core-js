import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
const from = _Array$from;
// RestElement coexists with regular static destructure: `const { from, ...rest } = Array`.
// destructure-emitter emits body-extract `const from = _Array$from;` + AST-mutates the
// destructure value to `_unused` (preserves rest semantics). receiver narrowing through
// `arr = from('hi')` finds the polyfill entry via injector's body-extract alias map -
// `staticPairFromPolyfillEntry(scope, 'from')` returns 'array/from' regardless of AST
// shape, so `arr.at` narrows to `_atMaybeArray`. babel and unplugin emit identical output
const {
  from: _unused,
  ...rest
} = Array;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, p => p);
_copyWithinMaybeArray(arr).call(arr, 0, 1);