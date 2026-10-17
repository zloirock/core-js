// A hole keeps its initializer effect ahead of the captured nested property read.
function holeThenSlot(eff, getArr) {
  const [, { y: { at: holeAt } }] = [eff(), { y: getArr() }];
  return holeAt;
}
export default [holeThenSlot(() => 1, () => [4])];
