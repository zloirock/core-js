import _atInstanceProperty from "@core-js/pure/actual/instance/at";
const items = getItems();
function getItems() {
  return items || [];
}
_atInstanceProperty(items).call(items, 0);