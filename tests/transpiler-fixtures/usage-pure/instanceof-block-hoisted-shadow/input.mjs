// A block-hoisted local constructor is not the same-named global.
export function read(value) {
  { var Array = Map; }
  if (value instanceof Array) return value.at(0);
  return null;
}
