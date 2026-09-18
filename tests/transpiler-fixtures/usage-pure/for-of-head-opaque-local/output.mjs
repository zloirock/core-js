import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
// An iteration whose elements cannot be paired does not itself release their constructors.
// Unused heads, intrinsic properties and local aliases require no Map static namespace.
async function awaited() {
  for await (const value of [_Map]) {
    const alias = value;
    void _nameMaybeFunction(alias);
  }
}
function spread() {
  for (const value of [...[_Map]]) void _nameMaybeFunction(value);
}
function sparse() {
  for (const value of [, _Map]) void value;
}
function named() {
  const values = [_Map];
  for (const value of values) {}
}