import "core-js/modules/es.array.of";
// A guarded default after a native sibling preserves an assignment's value.
// An earlier native default can rebind the source without changing the later read.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  let before, method;
  const result = {
    before = (M = {}, 6),
    of: method = 9
  } = M;
  return [before, method, result === source];
}