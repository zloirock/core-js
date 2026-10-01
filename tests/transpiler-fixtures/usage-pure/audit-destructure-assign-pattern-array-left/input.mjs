// AssignmentPattern wraps an ArrayPattern at the LHS of a function param: the inner
// destructure is itself an array pattern, the receiver default is `Array`. Static
// classification rules lock per-key dispatch on the inner array slot when defined,
// distinct prototype methods on subsequent receivers narrow expectations
function takeArr([first = 0] = []) {
  return [first].at(0);
}
function rotateMap({ size, has, get } = new Map()) {
  return [size, has(1), get(2)];
}
export { takeArr, rotateMap };
