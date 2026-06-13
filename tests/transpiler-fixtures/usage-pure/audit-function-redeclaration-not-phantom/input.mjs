function outer() {
  function F() {
    return [1, 2, 3];
  }
  function F() {
    return 'str';
  }
  return F().at(0);
}
export const r = outer();
