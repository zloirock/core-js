// inner-default AssignmentPattern inside a multi-element ArrayPattern (`[, { from } = {}]`): the
// transparent default is peeled, `from` extracts to `_Array$from` and the residual keeps both the
// default (`{ from: _unused } = {}`) and the `_Set` slot. detect-usage resolves the receiver
// through the AssignmentPattern + ArrayPattern wrappers on both plugins (array-wrapper resolver)
const [, { from } = {}] = [Set, Array];
from([1]);
