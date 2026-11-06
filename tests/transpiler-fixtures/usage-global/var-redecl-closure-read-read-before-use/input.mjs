function readBeforeUse() {
  var a = [1, 2];
  { var a = 'xy'; }
  const g = () => a.includes(1);
  return g();
}
export const r = [readBeforeUse()];
