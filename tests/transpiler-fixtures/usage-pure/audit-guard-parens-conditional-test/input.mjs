// An optional instance call forms the test of a conditional expression.
// The rewritten nullish guard must stay inside that test.
const x = arr?.at(0) ? 1 : 2;
