function getArr(): number[] {
  return [1, 2, 3];
}
function identity(x) {
  return x;
}
identity(getArr()).at(-1);
