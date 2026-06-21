import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `[Symbol.iterator]` computed key paired with a NESTED ObjectPattern value (not a simple
// binding identifier). the destructuring transform bails on the nested-value shape, but the
// key must NOT be marked skipped before that bail - doing so suppressed the standalone
// Symbol-Identifier visitor and silently dropped `_Symbol$iterator`. bailing before the skip
// restores the `_Symbol$iterator` import for the in-key reference.
const obj = {};
const {
  [_Symbol$iterator]: {
    call: fn
  }
} = obj;
fn;