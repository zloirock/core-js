import _at from "@core-js/pure/actual/instance/at";
// An optional instance call forms the test of a conditional expression.
// The rewritten nullish guard must stay inside that test.
const x = (arr == null ? void 0 : _at(arr).call(arr, 0)) ? 1 : 2;