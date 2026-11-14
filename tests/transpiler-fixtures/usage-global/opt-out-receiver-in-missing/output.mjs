import "core-js/modules/es.function.name";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
Function("delete globalThis.Promise")();
try {
  // core-js-disable-next-line
  r = "resolve" in Promise; // core-js-disable-line
} catch (e) {
  r = e.name;
}