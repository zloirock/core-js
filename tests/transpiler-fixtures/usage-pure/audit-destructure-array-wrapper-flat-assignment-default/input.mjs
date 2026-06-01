// single-element ArrayPattern wrapping an AssignmentPattern-defaulted ObjectPattern:
// `[{ from } = {}]`. both the ArrayPattern and the inner default are transparent wrappers,
// so the static flattens to `const from = _Array$from` (the array-wrapper resolver peels the
// inner-default AssignmentPattern) rather than staying a native destructure binding
const [{ from } = {}] = [Array];
from([1, 2, 3]);
