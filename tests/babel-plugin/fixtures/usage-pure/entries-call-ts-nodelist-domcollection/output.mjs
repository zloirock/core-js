import _entries from "@core-js/pure/actual/instance/entries";
function f(list: NodeList) {
  _entries(list).call(list);
}