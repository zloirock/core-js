import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// block-bodied IIFE with prefix ExpressionStatement: `singleReturnBodyExpression` accepts
// ExpressionStatement preceding the single ReturnStatement (their side effects propagate
// through the polyfill emit's `meta.sideEffects` channel). `findReturnPath` walks the body
// to locate the ReturnStatement.argument path - ret is the proxy-global identifier
let setup = 0;
const out = ((() => {
  setup++;
  return _globalThis;
})(), _Array$from)([1, 2, 3]);
_atMaybeArray(out).call(out, 0);