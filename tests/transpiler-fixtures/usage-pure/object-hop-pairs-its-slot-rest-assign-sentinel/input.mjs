function restAssignSentinel() {
  let restAt;
  let restRest;
  ({ w: { at: restAt }, ...restRest } = { w: [1, 2], z: 1 });
  return [restAt, restRest];
}
export default [restAssignSentinel()];
