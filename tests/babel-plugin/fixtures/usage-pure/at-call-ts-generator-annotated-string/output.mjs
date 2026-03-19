import _at from "@core-js/pure/actual/string/at";
function* gen(): Generator<string> {
  yield "x";
}
for (const x of gen()) {
  _at(x).call(x, 0);
}