let v;
let va;
export function keepValue(v) {
  return v;
}
export const valueArgSelf = keepValue((va = globalThis).self);
