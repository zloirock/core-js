// NEGATIVE: an intrinsic-spelled tag in a param default references nothing.
export const intrinsicInParamDefault = (function span({ ['race']: race } = Promise, cb = () => <span x={1} />) {
  return [race, cb];
})();
