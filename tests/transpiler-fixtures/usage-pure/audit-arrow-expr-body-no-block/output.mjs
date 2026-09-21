import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An arrow with an expression body mirrors the supplied constructor at its closed call site.
// The symbol slot keeps its own value beside the static, without needing a body extraction.
const fn = ({
  [_Symbol$iterator]: iter,
  from
}) => from([1, 2]);
fn({
  [_Symbol$iterator]: _getIteratorMethod(Array),
  from: _Array$from
});