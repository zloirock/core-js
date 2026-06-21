import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// block-bodied IIFE with prefix ExpressionStatement: the single-return inline-call resolution
// must accept an ExpressionStatement preceding the single ReturnStatement (its side effects
// ride the polyfill emit's side-effect channel) and locate the ReturnStatement.argument as the
// inline body expression - here the argument is the proxy-global identifier
let setup = 0;
const out = ((() => {
  setup++;
  return _globalThis;
})(), _Array$from)([1, 2, 3]);
_atMaybeArray(out).call(out, 0);