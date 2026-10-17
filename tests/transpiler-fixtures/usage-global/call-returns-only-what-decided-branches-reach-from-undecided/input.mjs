function undecided() {
  if (globalThis.flag) return 'abc';
  return [1];
}
export const fromUndecided = undecided().slice(1);
