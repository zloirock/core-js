import _Map from "@core-js/pure/actual/map";
const hopSource = {
  Map: _Map
};
const hopped = hopSource;
const {
  Map: {
    groupBy: viaHop
  },
  ...hopRest
} = hopped;
export { viaHop, hopRest };