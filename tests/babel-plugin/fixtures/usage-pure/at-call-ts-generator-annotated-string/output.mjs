import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function* gen(): Generator<string> {
  yield "x";
}
for (const x of gen()) {
  _atInstanceProperty(x).call(x, 0);
}