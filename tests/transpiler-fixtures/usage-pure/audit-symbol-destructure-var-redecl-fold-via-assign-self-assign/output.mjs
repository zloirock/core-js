import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// an identity self-assign writes the alias's own current value back, so it is not a write of the
// binding: both destructure forms keep exactly one real write and still fold on both emitters
var selfAssigned;
selfAssigned = _Symbol$iterator;
selfAssigned = selfAssigned;
export const viaAssignSelfAssign = _getIteratorMethod([]);