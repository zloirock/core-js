function undecided() {
  if (globalThis.flag) return 'abc';
  return [1];
}
export const fromUndecided = undecided().slice(1);
undecided().at(1);

function arrayOnly() {
  if (globalThis.flag) return [2];
  return [1];
}
export const fromArray = arrayOnly().at(0);
