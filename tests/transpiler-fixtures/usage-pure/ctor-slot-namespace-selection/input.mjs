export function select(selectLeft) {
  const leftArm = { Map, arm: 'left' };
  const rightArm = { Map, arm: 'right' };
  const armed = selectLeft && leftArm || rightArm;
  const { Map: { groupBy: viaArms }, ...armsRest } = armed;
  return [viaArms, armsRest];
}
