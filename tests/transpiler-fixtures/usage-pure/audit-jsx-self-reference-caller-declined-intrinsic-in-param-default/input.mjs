export const intrinsicInParamDefault = (function span({ race, ...rest } = Promise, cb = () => <span x={1} />) {
  return [race, rest, cb];
})();
