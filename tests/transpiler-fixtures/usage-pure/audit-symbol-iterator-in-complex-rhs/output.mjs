import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `Symbol.iterator in complexRhs`: the iterability `in`-check must still recognise the
// well-known symbol on the LHS even when the RHS is a complex expression.
const k = _Symbol$iterator;
const obj = {
  data: [1, 2, 3]
};
_isIterable(obj.data);