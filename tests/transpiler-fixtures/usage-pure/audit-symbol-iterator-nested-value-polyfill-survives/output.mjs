import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// `[Symbol.iterator]` computed key paired with a NESTED ObjectPattern value (not a simple
// binding identifier). the destructuring transform bails on the nested-value shape, but the
// key must NOT be marked skipped before that bail - doing so suppressed the standalone
// Symbol-Identifier visitor and silently dropped `_Symbol$iterator`. bailing before the skip
// restores the `_Symbol$iterator` import for the in-key reference.
const obj = {};
const {
  call: fn
} = _getIteratorMethod(obj);
fn;