import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// an ALL-PROXY fallback receiver (every branch a global proxy) is wholly discardable, so the
// flatten owns the `[Symbol.iterator]` extraction (bound to the collapsed operand); a
// surviving rest residual keeps the BRANCHING read - the ternary stays in the init with its
// operands polyfilled, matching the per-branch semantics of the untouched pattern
const it = _getIteratorMethod(_globalThis);
const {
  [_Symbol$iterator]: _unused,
  ...r
} = c ? _globalThis : _self;
it;
r;
const it2 = _getIteratorMethod(_globalThis);
const f = _Array$from;
it2;
f(x);