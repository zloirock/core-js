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
  use(arr.a.t.at(0));
}
for (arr['a.k:t'] of items) {
  use(arr.a.t.at(1));
}
// a bigint-spelled key: the parsers carry it differently (a dedicated literal node vs a
// bigint value) - the same-shape walk must treat both spellings as one slot without choking
for (arr[1n] of items) {
  use(arr[1n].at(2), arr[7n]);
}
