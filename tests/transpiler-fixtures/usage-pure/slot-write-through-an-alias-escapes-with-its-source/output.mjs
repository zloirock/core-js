import _Map from "@core-js/pure/actual/map";
// A slot write through a plain alias lands on the container its source holds: handing the source
// out hands out the constructor written through the alias, statics included.
const box = {};
const alias = box;
alias.slot = _Map;
hand(box);