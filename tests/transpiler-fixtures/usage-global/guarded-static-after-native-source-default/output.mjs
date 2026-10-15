import "core-js/modules/es.array.of";
// A native default can rebind the source before an undefaulted static guard.
// Both reads belong to the original receiver, rather than the value installed by the default.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  const {
    before = (M = {}, 6),
    of: method
  } = M;
  return [before, method];
}