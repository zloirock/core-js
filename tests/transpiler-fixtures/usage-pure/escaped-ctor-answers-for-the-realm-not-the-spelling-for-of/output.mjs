import _globalThis from "@core-js/pure/actual/global-this";
// An escaping reference answers for the value the REALM holds under that name, never for the spelling: a leaf resolving to a
// binding this file wrote hands out that binding, so the constructor's family is not owed and the read below keeps its own module
// alone.
function hand(x) {
  _globalThis.taken = x;
}
for (const URL of list) hand(URL);