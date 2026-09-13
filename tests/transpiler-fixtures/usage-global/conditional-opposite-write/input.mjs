// Only one conditional arm runs, so its sibling write cannot replace the string.
export function read(flag) {
  let value = 'abc';
  return flag ? (value = [1, 2]) : value.at(0);
}
