import "core-js/modules/es.array.of";
// A single guarded assignment can overwrite its own source binding.
// Its value remains the original receiver, including when the source is a foreign object.
export function read(source) {
  let M = source;
  if (!M) M = Array;
  const result = {
    of: M
  } = M;
  return [M, result === source];
}