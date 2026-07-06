import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const f = _Array$from;
const it = _getIteratorMethod(Array);
// composition of two destructure pipelines over one declarator: the array-wrapped static
// extract claims the literal-keyed prop (preceding decl + rest sentinel), the symbol-key
// handling rebuilds the declarator - the rebuild must render the claimed prop VERBATIM so
// the claimer's queued transforms compose into it (a re-consume double-sentinels the prop
// and crashes the transform queue)
const [{
  'from': _unused,
  [_Symbol$iterator]: _unused2,
  ...r
}] = [Array];
f([1]);
it;
r;