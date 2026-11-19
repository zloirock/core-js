import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// An iterator slot keyed with an effect over an array literal memoizes the literal and runs the effect where
// the source wrote it, ahead of the iterator method the nested level reads its name off.
const name = (se(), _nameMaybeFunction(_getIteratorMethod([1, 2])));
export { name };