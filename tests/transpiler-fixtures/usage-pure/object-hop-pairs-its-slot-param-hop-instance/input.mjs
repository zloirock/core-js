function paramHopInstance({ w: { at: viaParamInstance } } = { w: [1, 2] }) {
  return viaParamInstance;
}
export default [paramHopInstance()];
