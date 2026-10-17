import _Map from "@core-js/pure/actual/map";
// A loop pattern assigns into the outer binding, even from a nested closure.
// Handing that binding out requires every static on its substituted constructor.
function expose() {
  let value;
  function install() {
    for ([value] of [[_Map]]) {}
  }
  install();
  hand(value);
}