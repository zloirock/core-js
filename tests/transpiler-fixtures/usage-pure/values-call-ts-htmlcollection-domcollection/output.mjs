import _valuesMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/values";
// @ts-expect-error the member read is the probe, and the right answer is a type without it
function f(col: HTMLCollection) {
  _valuesMaybeDomCollections(col).call(col);
}