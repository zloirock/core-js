import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
Function("delete globalThis.Promise")();
try {
  // core-js-disable-next-line
  r = "resolve" in Promise; // core-js-disable-line
} catch (e) {
  r = _nameMaybeFunction(e);
}