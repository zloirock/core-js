import _Map from "@core-js/pure/actual/map";
function paramHopWrapped([{
  w: {
    Map: viaParamWrapped
  }
}] = [{
  w: {
    Map: _Map
  }
}]) {
  return viaParamWrapped;
}
export default [paramHopWrapped()];