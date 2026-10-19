import _forEachMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/for-each";
// @ts-expect-error the member read is the probe, and the right answer is a type without it
function f(col: HTMLCollection) {
  _forEachMaybeDomCollections(col).call(col, el => console.log(el));
}