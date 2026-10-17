import _includes from "@core-js/pure/actual/instance/includes";
// Both builtin prototype families contribute includes, without unrelated iterator methods.
export function read(flag) {
  const includes = _includes((flag ? Array : String).prototype);
  return includes.call([4], '4');
}
export const result = [read(true), read(false)];