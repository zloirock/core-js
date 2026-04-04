import _at from "@core-js/pure/actual/instance/at";
const items = getItems();
function getItems() { return items || []; }
_at(items).call(items, 0);