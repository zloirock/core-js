export const selfRefInParamDefault = (function P({ all, ...rest } = Promise, cb = () => <P x={1} />) {
  return [all, rest, cb];
})();
