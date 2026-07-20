import _at from "@core-js/pure/actual/instance/at";
let arr = [];
for (arr.at of items) {
  use(arr.at);
}
// the bracket spelling reads the same written slot as the dot head - stays raw like the dot form
for (arr.at of items) {
  use(arr['at']);
}
// a bracket key CONTAINING dot / delimiter-like text is a DIFFERENT slot than the deep nav -
// the body read is not aliased by the head write and keeps its polyfill
for (arr['a.t'] of items) {
  var _ref;
  use(_at(_ref = arr.a.t).call(_ref, 0));
}
for (arr['a.k:t'] of items) {
  var _ref2;
  use(_at(_ref2 = arr.a.t).call(_ref2, 1));
}
// a bigint-spelled key: the parsers carry it differently (a dedicated literal node vs a
// bigint value) - the same-shape walk must treat both spellings as one slot without choking
for (arr[1n] of items) {
  var _ref3;
  use(_at(_ref3 = arr[1n]).call(_ref3, 2), arr[7n]);
}