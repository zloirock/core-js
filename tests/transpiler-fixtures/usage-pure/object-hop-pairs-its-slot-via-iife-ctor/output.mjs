import _Map from "@core-js/pure/actual/map";
const viaIifeCtor = (({
  w: {
    Map: m
  }
}) => m)({
  w: {
    Map: _Map
  }
});
export default [viaIifeCtor];