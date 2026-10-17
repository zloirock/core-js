import _includes from "@core-js/pure/actual/instance/includes";
// A selected constructor's prototype member uses the same family union as a nested pattern.
export function read(flag) {
  return _includes((flag ? Array : String).prototype).call([4], '4');
}
export const result = [read(true), read(false)];