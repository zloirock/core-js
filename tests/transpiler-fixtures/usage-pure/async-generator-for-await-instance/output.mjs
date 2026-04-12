import _at from "@core-js/pure/actual/instance/at";
async function* ag() {
  for await (const x of iter) {
    _at(x).call(x, 0);
  }
}