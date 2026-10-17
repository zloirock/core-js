function paramHopWrapped([{ w: { Map: viaParamWrapped } }] = [{ w: globalThis }]) {
  return viaParamWrapped;
}
export default [paramHopWrapped()];
