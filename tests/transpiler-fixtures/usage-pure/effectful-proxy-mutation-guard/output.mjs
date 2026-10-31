import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Effectful realm keys preserve native guards and sealed mutation throws.
// Assignment, update, pattern and loop write targets keep both key effects.
export function write(value) {
  ((effect(), _self)[effect(), 'window']?.Object).probe = value;
}
export function update() {
  ((effect(), _self)[effect(), 'window']?.Object).probe++;
}
export function assign(values) {
  [((effect(), _self)[effect(), 'window']?.Object).probe] = values;
}
export function iterate(values) {
  for (((effect(), _self)[effect(), 'window']?.Object).probe of values);
}
export const read = (_globalThis[effect(), 'self'][effect(), 'window']?.Object).probe;