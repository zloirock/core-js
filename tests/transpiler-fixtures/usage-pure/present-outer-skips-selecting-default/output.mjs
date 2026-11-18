import _Map from "@core-js/pure/actual/map/constructor";
// The outer Map exists; its missing Map property throws before the default can run.
const {
  Map: {
    groupBy: method
  }
} = _Map;
consume(method);