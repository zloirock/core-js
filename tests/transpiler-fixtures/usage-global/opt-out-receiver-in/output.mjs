// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
function pick() {
  // core-js-disable-next-line
  return "resolve" in Promise; // core-js-disable-line
}
r = pick();