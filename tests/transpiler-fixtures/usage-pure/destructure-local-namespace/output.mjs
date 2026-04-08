import _Map from "@core-js/pure/actual/map/constructor";
const SomeNS = {
  Map: _Map
};
const {
  Map
} = SomeNS;
new Map().has('x');