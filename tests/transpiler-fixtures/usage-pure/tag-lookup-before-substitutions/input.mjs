// A selected tag reads its receiver and method before the substitutions.
// A non-callable result still evaluates the substitutions before it throws.
export function read(builtin, replacement, observe) {
  let C = builtin ? Array : replacement;
  return C.of`value${ observe(() => { C = Array; }) }`;
}
export function optional(list) {
  return (list?.at)`value`;
}
