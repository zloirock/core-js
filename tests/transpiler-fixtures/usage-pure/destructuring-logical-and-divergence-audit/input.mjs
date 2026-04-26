// `const { from } = cond && Array` with logical-AND: each branch is handled independently.
// the `Array` branch becomes its own `{from: _Array$from}` literal (`Array.from` has a
// pure entry); the `cond` branch is left raw (unknown identifier). when `cond` is falsy
// the destructure on the falsy value yields `from = undefined` per spec
const { from } = cond && Array;
use(from);
