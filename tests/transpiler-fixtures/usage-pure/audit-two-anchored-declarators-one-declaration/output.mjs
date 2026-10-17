import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// two independent hop anchors sharing one declaration: each slot re-anchors to its own
// constructor binding and the declaration splits statement-per-declarator
const {
  customA
} = _Map;
const {
  customB
} = _Promise;
console.log(customA, customB);