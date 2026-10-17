// A selected constructor's prototype member uses the same family union as a nested pattern.
export function read(flag) {
  return (flag ? Array : String).prototype.includes.call([4], '4');
}
export const result = [read(true), read(false)];
