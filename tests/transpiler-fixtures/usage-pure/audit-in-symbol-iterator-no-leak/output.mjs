import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `Symbol.iterator in obj` rewrites to `_isIterable(obj)`. the inner `Symbol` Identifier
// inside the LHS MemberExpression must NOT trigger a separate proxy-global rewrite
// (no spurious `_Symbol` import). asserts the in-expression dispatch fully subsumes the
// `Symbol.iterator` access without leaking through to the identifier visitor
declare const obj: any;
const x = _isIterable(obj);
const y = _Symbol$iterator;