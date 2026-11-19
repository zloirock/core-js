import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Suspended user values are evaluated once before the nested instance read.
async function read(source) {
  const at = _at((await source).list);
  const includes = _includes((note(), await source).list);
  return [at, includes];
}
function* resume() {
  const flat = _flatMaybeArray((yield 1).list);
  return flat;
}