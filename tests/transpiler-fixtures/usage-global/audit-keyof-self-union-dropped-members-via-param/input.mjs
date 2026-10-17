// runtime analogue through a constrained type param: the untyped member bails the same way
interface LooseC {
  cs: number[];
  loose;
}
export function viaParam<T extends LooseC>(o: T, k: keyof T) {
  return o[k].includes(3);
}
