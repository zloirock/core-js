import _at from "@core-js/pure/actual/instance/at";
// A hole keeps its initializer effect ahead of the captured nested property read.
function holeThenSlot(eff, getArr) {
  const [, _ref] = [eff(), {
    y: getArr()
  }];
  const holeAt = _at(_ref.y);
  return holeAt;
}
export default [holeThenSlot(() => 1, () => [4])];