// a `||` / `??` whose left is the pure import this build mints for a static (`Array.from`) always
// yields that static, so a call through the selection returns what the static returns. an import of
// it the user wrote, a const alias of the import and an import from another package decide nothing
import arrayOf from '@core-js/pure/actual/array/of';
import foreignFrom from 'my-lib/array/from';
function toArray(value) {
  return value;
}
export function minted(source) {
  const from = Array.from || toArray;
  return from(source).at(0);
}
export function nullish(source) {
  const from = Array.from ?? toArray;
  return from(source).values();
}
export function written(item) {
  const of = arrayOf || toArray;
  return of(item).entries();
}
const heldOf = arrayOf;
export function aliased(item) {
  const of = heldOf || toArray;
  return of(item).includes(1);
}
export function foreign(source) {
  const from = foreignFrom || toArray;
  return from(source).keys();
}
