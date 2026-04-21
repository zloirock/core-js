import _Map from "@core-js/pure/actual/map/constructor";
// Same global in both update (skip) and reference (polyfill) positions.
if (_Map) {
  Map!++;
}
const m = new _Map();