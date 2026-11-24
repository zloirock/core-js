import _Map from "@core-js/pure/actual/map";
export function select(selectLeft) {
  const leftArm = {
    Map: _Map,
    arm: 'left'
  };
  const rightArm = {
    Map: _Map,
    arm: 'right'
  };
  const armed = selectLeft && leftArm || rightArm;
  const {
    Map: {
      groupBy: viaArms
    },
    ...armsRest
  } = armed;
  return [viaArms, armsRest];
}