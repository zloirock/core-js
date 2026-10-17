import _includes from "@core-js/pure/actual/instance/includes";
// runtime analogue through a constrained type param: the untyped member bails the same way
interface LooseC {
  cs: number[];
  loose;
}
export function viaParam<T extends LooseC>(o: T, k: keyof T) {
  var _ref;
  return _includes(_ref = o[k]).call(_ref, 3);
}